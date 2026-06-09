import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface PendingOrderNotification {
  order_id: string;
  customer_name: string;
  total: number;
  delivery_address: string;
  created_at: Date | null;
}

export const vendorNotificationsApi = {
  getPendingOrders: async (): Promise<PendingOrderNotification[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/vendor/orders/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
