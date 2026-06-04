export interface OrderReportRow {
  order_id: string;
  user_id: number;
  vendor_id: number;
  courier_id: number | null;
  status: string;
  delivery_address: string;
  total: number;
  items_count: number;
  created_at: Date;
}

export interface PaymentReportRow {
  payment_id: string;
  order_id: string;
  user_id: number;
  vendor_id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  reference: string;
  customer_email: string;
  created_at: Date;
}

export interface UserReportRow {
  user_id: number;
  user_email: string;
  firstName: string;
  firstLastName: string;
  cellphone: string;
  verification_status: string;
  roles: string;
}

export interface VendorReportRow {
  vendor_id: number;
  business_name: string;
  business_type: string;
  address: string;
  phone: string;
  status: string;
  user_email: string;
  total_orders: number;
  total_revenue: number;
}

export interface ReportFilters {
  from?: string;
  to?: string;
  status?: string;
  vendor_id?: number;
  courier_id?: number;
}
