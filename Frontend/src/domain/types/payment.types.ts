export type PaymentStatus = "PENDING" | "APPROVED" | "DECLINED" | "ERROR" | "VOIDED";

export interface PaymentResponse {
  id: string;
  order_id: string;
  user_id: number;
  vendor_id: number;
  wompi_transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  reference: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  order_id: string;
  payment_method: {
    type: string;
    token: string;
  };
  customer_email: string;
  transaction_id?: string;
  reference?: string;
}
