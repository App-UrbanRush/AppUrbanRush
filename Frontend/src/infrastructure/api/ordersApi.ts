import { authApi } from "./authApi";

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateOrderRequest {
  user_id: number;
  vendor_id: number;
  delivery_address: string;
  items: OrderItemInput[];
  customer_lat?: number;
  customer_lng?: number;
}

export interface OrderItemDetail {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url?: string | null;
}

export interface OrderDetail {
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
  items: OrderItemDetail[];
  created_at: string;
  delivery_code?: string | null;
  estimated_delivery?: string;
  customer_lat?: number | null;
  customer_lng?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_avatar?: string | null;
  vendor_lat?: number | null;
  vendor_lng?: number | null;
  vendor_name?: string | null;
  vendor_address?: string | null;
  vendor_logo?: string | null;
  courier_name?: string | null;
  courier_phone?: string | null;
  courier_avatar?: string | null;
  courier_vehicle_type?: string | null;
}

export const ordersApi = {
  getById: async (orderId: string): Promise<OrderDetail> => {
    const response = await authApi.get(`/orders/${orderId}`);
    return response.data;
  },

  getByUser: async (userId: number | string): Promise<OrderDetail[]> => {
    const response = await authApi.get(`/orders/user/${userId}`);
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<OrderDetail> => {
    const response = await authApi.post(`/orders`, data);
    return response.data;
  },

  updateStatus: async (orderId: string, status: string, courierId?: number): Promise<OrderDetail> => {
    const body: any = { status };
    if (courierId !== undefined) {
      body.courier_id = courierId;
    }
    
    let endpoint: string;
    if (courierId !== undefined && status === 'IN_DELIVERY') {
      endpoint = `/orders/${orderId}/assign-courier`;
    } else {
      endpoint = `/orders/${orderId}/status/vendor`;
    }
    
    const response = await authApi.put(endpoint, body);
    return response.data;
  },
};
