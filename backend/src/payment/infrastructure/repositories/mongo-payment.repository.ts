import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { PaymentModel } from '../../domain/entities/payment.model';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class MongoPaymentRepository implements IPaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async create(payment: PaymentModel): Promise<PaymentModel> {
    const created = new this.paymentModel({
      order_id: payment.order_id,
      wompi_transaction_id: payment.wompi_transaction_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method,
      reference: payment.reference,
      customer_email: payment.customer_email,
    });
    const saved = await created.save();
    return PaymentMapper.toDomain(saved);
  }

  async findByOrderId(orderId: string): Promise<PaymentModel | null> {
    const doc = await this.paymentModel.findOne({ order_id: orderId }).exec();
    return doc ? PaymentMapper.toDomain(doc) : null;
  }

  async findByReference(reference: string): Promise<PaymentModel | null> {
    const doc = await this.paymentModel.findOne({ reference }).exec();
    return doc ? PaymentMapper.toDomain(doc) : null;
  }

  async updateStatus(id: string, status: string): Promise<PaymentModel | null> {
    const updated = await this.paymentModel
      .findByIdAndUpdate(id, { status }, { returnDocument: 'after' })
      .exec();
    return updated ? PaymentMapper.toDomain(updated) : null;
  }
}
