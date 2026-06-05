import axios from "axios";
import type { VendorDashboardStats } from "../../domain/types/vendor-dashboard.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const vendorDashboardApi = {
  getDashboardStats: async (token: string): Promise<VendorDashboardStats> => {
    const response = await axios.get<VendorDashboardStats>(`${API_URL}/vendor/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};