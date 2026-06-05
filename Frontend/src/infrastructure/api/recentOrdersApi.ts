import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { RecentOrder } from "../../domain/types/recent-orders.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const recentOrdersApi = {
  getRecentOrders: async (): Promise<RecentOrder[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<RecentOrder[]>(`${API_URL}/orders/vendor-dashboard/recent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getAllVendorOrders: async (vendorId: number): Promise<RecentOrder[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<RecentOrder[]>(`${API_URL}/orders/vendor/${vendorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};