import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayoutTransaction, PayoutTransactionDocument } from '../schemas/payout-transaction.schema';
import { IPayoutTransactionRepository } from '../../domain/repositories/payout-transaction.repository.interface';
import { PayoutTransactionModel, PayoutStatus } from '../../domain/entities/payout-transaction.model';
import { PayoutTransactionMapper } from '../mappers/payout-transaction.mapper';

@Injectable()
export class MongoPayoutTransactionRepository implements IPayoutTransactionRepository {
  constructor(
    @InjectModel(PayoutTransaction.name)
    private readonly model: Model<PayoutTransactionDocument>,
  ) {}

  async create(payout: PayoutTransactionModel): Promise<PayoutTransactionModel> {
    const created = new this.model({
      user_id: payout.user_id,
      beneficiary_type: payout.beneficiary_type,
      bank_account_id: payout.bank_account_id,
      bank_account_snapshot: payout.bank_account_snapshot,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      wompi_transaction_id: payout.wompi_transaction_id,
      reference: payout.reference,
      failure_reason: payout.failure_reason,
      earning_ids: payout.earning_ids,
    });
    const saved = await created.save();
    return PayoutTransactionMapper.toDomain(saved);
  }

  async updateStatus(
    id: string,
    status: PayoutStatus,
    extra: { wompi_transaction_id?: string; failure_reason?: string; completed_at?: Date },
  ): Promise<PayoutTransactionModel | null> {
    const update: any = { status };
    if (extra.wompi_transaction_id !== undefined) update.wompi_transaction_id = extra.wompi_transaction_id;
    if (extra.failure_reason !== undefined) update.failure_reason = extra.failure_reason;
    if (extra.completed_at !== undefined) update.completed_at = extra.completed_at;

    const updated = await this.model.findByIdAndUpdate(id, update, { returnDocument: 'after' }).exec();
    return updated ? PayoutTransactionMapper.toDomain(updated) : null;
  }

  async findById(id: string): Promise<PayoutTransactionModel | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? PayoutTransactionMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: number): Promise<PayoutTransactionModel[]> {
    const docs = await this.model.find({ user_id: userId }).sort({ createdAt: -1 }).exec();
    return docs.map(PayoutTransactionMapper.toDomain);
  }

  async findAll(filter?: { status?: PayoutStatus }): Promise<PayoutTransactionModel[]> {
    const q: any = {};
    if (filter?.status) q.status = filter.status;
    const docs = await this.model.find(q).sort({ createdAt: -1 }).exec();
    return docs.map(PayoutTransactionMapper.toDomain);
  }
}
