export interface CourierOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CourierOrder {
  order_id: string;
  user_id: number;
  vendor_id: number;
  courier_id: number | null;
  status: string;
  delivery_address: string;
  subtotal: number;
  delivery_fee: number;
  platform_commission: number;
  total: number;
  items: CourierOrderItem[];
  created_at: string | null;
}
