import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface CourierProfileData {
  couriers_id: number;
  vehicle_type: string;
  vehicle_plate: string | null;
  soat_number: string | null;
  photo_url: string | null;
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

  updateProfile: async (userId: number, data: Partial<Pick<CourierProfileData, 'vehicle_type' | 'vehicle_plate' | 'soat_number' | 'photo_url' | 'status'>>): Promise<CourierProfileData> => {
    const token = authLocalStorage.getToken();
    const response = await axios.patch(`${API_URL}/couriers/${userId}/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
