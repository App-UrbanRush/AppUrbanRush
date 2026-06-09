import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface VendorPhoto {
  photo_id: string;
  image_url: string;
  order: number;
  type: string;
}

export const vendorPhotosApi = {
  upload: async (file: File): Promise<{ photo_id: string; image_url: string; public_id: string }> => {
    const token = authLocalStorage.getToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${API_URL}/vendor/photos`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAll: async (): Promise<VendorPhoto[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/vendor/photos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  remove: async (photoId: string): Promise<{ message: string }> => {
    const token = authLocalStorage.getToken();
    const response = await axios.delete(`${API_URL}/vendor/photos/${photoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
