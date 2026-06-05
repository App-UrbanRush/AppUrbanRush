export interface OrderItemDTO {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface VendorRecentOrderDTO {
  order_id: string;
  customer_name: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY';
  courier_name: string | null;
  total: number;
  time_elapsed: string;
  items: OrderItemDTO[];
  delivery_address: string;
}