import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { CourierBalance } from "../../domain/types/earnings.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const earningsApi = {
  getCourierBalance: async (courierId: number): Promise<CourierBalance> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/liquidation/courier/${courierId}/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
