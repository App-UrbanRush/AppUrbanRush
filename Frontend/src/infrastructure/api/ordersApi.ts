import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
});

export interface OrderDetail {
  order_id: string;
  user_id: number;
  vendor_id: number;
  courier_id: number | null;
  status: string;
  delivery_address: string;
  total: number;
  // El backend solo lo incluye para el dueño / courier asignado / admin
  delivery_code?: string | null;
}

export const ordersApi = {
  getById: async (orderId: string): Promise<OrderDetail> => {
    const response = await axios.get(`${API_URL}/orders/${orderId}`, authHeader());
    return response.data;
  },
};
