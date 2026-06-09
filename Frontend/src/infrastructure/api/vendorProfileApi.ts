import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface UpdateVendorProfileData {
  address?: string;
  business_hours?: string;
  phone?: string;
  description?: string;
}

export const vendorProfileApi = {
  getProfile: async (): Promise<any> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/vendor/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateProfile: async (data: UpdateVendorProfileData): Promise<any> => {
    const token = authLocalStorage.getToken();
    const response = await axios.put(`${API_URL}/vendor/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
};