import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface CourierProfileData {
  couriers_id: number;
  vehicle_type: string;
  vehicle_plate: string | null;
  soat_number: string | null;
  status: string;
  user_id: number;
}

export const courierProfileApi = {
  getProfile: async (userId: number): Promise<CourierProfileData> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/couriers/${userId}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
