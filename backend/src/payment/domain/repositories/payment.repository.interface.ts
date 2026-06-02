import { PaymentModel } from '../entities/payment.model';

export interface IPaymentRepository {
  create(payment: PaymentModel): Promise<PaymentModel>;
  findByOrderId(orderId: string): Promise<PaymentModel | null>;
  findByReference(reference: string): Promise<PaymentModel | null>;
  findByUserId(userId: number): Promise<PaymentModel[]>;      
  findByVendorId(vendorId: number): Promise<PaymentModel[]>;  
  updateStatus(id: string, status: string): Promise<PaymentModel | null>;
}
