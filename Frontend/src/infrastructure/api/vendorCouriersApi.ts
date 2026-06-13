import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface VendorCourier {
  courier_id: number;
  name: string;
  photo_url: string | null;
  status: string;
}

export const vendorCouriersApi = {
  getAll: async (): Promise<VendorCourier[]> => {
    const token = authLocalStorage.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    const response = await axios.get(`${API_URL}/vendor/couriers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
