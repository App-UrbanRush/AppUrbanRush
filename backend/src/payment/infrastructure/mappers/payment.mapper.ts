import { PaymentModel } from '../../domain/entities/payment.model';
import { PaymentDocument } from '../schemas/payment.schema';

export class PaymentMapper {
  static toDomain(doc: PaymentDocument): PaymentModel {
    return new PaymentModel(
      doc._id.toString(),
      doc.order_id,
      doc.wompi_transaction_id,
      doc.amount,
      doc.currency,
      doc.status,
      doc.payment_method,
      doc.reference,
      doc.customer_email,
      (doc as any).createdAt ?? null,
      (doc as any).updatedAt ?? null,
    );
  }
}
