import { PayoutTransactionModel, PayoutBeneficiaryType, PayoutStatus } from '../../domain/entities/payout-transaction.model';
import { PayoutTransactionDocument } from '../schemas/payout-transaction.schema';

export class PayoutTransactionMapper {
  static toDomain(doc: PayoutTransactionDocument): PayoutTransactionModel {
    return new PayoutTransactionModel(
      doc._id.toString(),
      doc.user_id,
      doc.beneficiary_type as PayoutBeneficiaryType,
      doc.bank_account_id,
      {
        bank_name: doc.bank_account_snapshot.bank_name,
        account_type: doc.bank_account_snapshot.account_type,
        account_number_masked: doc.bank_account_snapshot.account_number_masked,
        holder_name: doc.bank_account_snapshot.holder_name,
      },
      doc.amount,
      doc.currency,
      doc.status as PayoutStatus,
      doc.wompi_transaction_id,
      doc.reference,
      doc.failure_reason,
      doc.earning_ids,
      (doc as any).createdAt ?? null,
      doc.completed_at,
    );
  }
}
