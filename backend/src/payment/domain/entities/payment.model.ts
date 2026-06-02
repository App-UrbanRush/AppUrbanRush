export class PaymentModel {
  constructor(
    public payment_id: string | null,
    public order_id: string,
    public user_id: number,
    public vendor_id: number,             
    public wompi_transaction_id: string,
    public amount: number,
    public currency: string,
    public status: string,
    public payment_method: string,
    public reference: string,
    public customer_email: string,
    public created_at: Date | null,
    public updated_at: Date | null,
  ) {}
}