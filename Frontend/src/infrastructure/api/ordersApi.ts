import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
});

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
}

export const ordersApi = {
  getById: async (orderId: string): Promise<OrderDetail> => {
    const response = await axios.get(`${API_URL}/orders/${orderId}`, authHeader());
    return response.data;
  },

  getByUser: async (userId: number | string): Promise<OrderDetail[]> => {
    const response = await axios.get(`${API_URL}/orders/user/${userId}`, authHeader());
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<OrderDetail> => {
    const response = await axios.post(`${API_URL}/orders`, data, authHeader());
    return response.data;
  },

  updateStatus: async (orderId: string, status: string, courierId?: number): Promise<OrderDetail> => {
    const body: any = { status };
    if (courierId !== undefined) {
      body.courier_id = courierId;
    }
    
    // Determinar el endpoint según el contexto
    let endpoint: string;
    if (courierId !== undefined && status === 'IN_DELIVERY') {
      // Si es IN_DELIVERY con courier_id, usar el endpoint de asignar courier (vendor)
      endpoint = `${API_URL}/orders/${orderId}/assign-courier`;
    } else if (courierId !== undefined && status === 'IN_DELIVERY') {
      // Endpoint para courier (no usado por vendor)
      endpoint = `${API_URL}/orders/${orderId}/status/courier`;
    } else {
      // Endpoint para vendor actualizando estado (sin courier)
      endpoint = `${API_URL}/orders/${orderId}/status/vendor`;
    }
    
    const response = await axios.put(endpoint, body, authHeader());
    return response.data;
  },
};
