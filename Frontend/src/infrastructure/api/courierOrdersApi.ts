import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
});

export const courierOrdersApi = {
  getByCourier: async (courierId: number): Promise<CourierOrder[]> => {
    const response = await axios.get(`${API_URL}/orders/courier/${courierId}`, authHeader());
    return response.data;
  },

  getAvailable: async (): Promise<CourierOrder[]> => {
    const response = await axios.get(`${API_URL}/orders/available`, authHeader());
    return response.data;
  },

  updateStatus: async (
    orderId: string,
    status: "IN_DELIVERY" | "DELIVERED",
    courierId: number,
  ): Promise<CourierOrder> => {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/status/courier`,
      { status, courier_id: courierId },
      authHeader(),
    );
    return response.data;
  },
};
