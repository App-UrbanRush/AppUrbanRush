import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { OrderTracking, VendorCourierLocation } from "../../domain/types/tracking.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const trackingApi = {
  getOrderTracking: async (orderId: string): Promise<OrderTracking> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/tracking/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getVendorCourierLocations: async (): Promise<VendorCourierLocation[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/tracking/vendor-couriers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
