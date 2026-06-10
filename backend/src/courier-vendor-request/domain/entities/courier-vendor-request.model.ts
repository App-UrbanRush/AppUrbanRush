export interface CourierVendorRequest {
  id: number | null;
  courier_user_id: number;
  vendor_id: number;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}
