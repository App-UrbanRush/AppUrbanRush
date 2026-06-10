import { PayoutTransactionModel, PayoutStatus } from '../entities/payout-transaction.model';

export interface IPayoutTransactionRepository {
  create(payout: PayoutTransactionModel): Promise<PayoutTransactionModel>;
  updateStatus(
    id: string,
    status: PayoutStatus,
    extra: { wompi_transaction_id?: string; failure_reason?: string; completed_at?: Date },
  ): Promise<PayoutTransactionModel | null>;
  findById(id: string): Promise<PayoutTransactionModel | null>;
  findByUserId(userId: number): Promise<PayoutTransactionModel[]>;
  findAll(filter?: { status?: PayoutStatus }): Promise<PayoutTransactionModel[]>;
}
