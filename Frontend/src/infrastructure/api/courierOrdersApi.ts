import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const courierOrdersApi = {
  getByCourier: async (courierId: number): Promise<CourierOrder[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/orders/courier/${courierId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
