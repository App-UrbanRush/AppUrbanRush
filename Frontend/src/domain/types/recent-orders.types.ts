export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface RecentOrder {
  order_id: string;
  customer_name: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  courier_name: string | null;
  courier_id: number | null;
  total: number;
  time_elapsed: string;
  items: OrderItem[];
  delivery_address: string;
}