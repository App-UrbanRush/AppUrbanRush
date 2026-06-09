import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const storageApi = {
  uploadVendorLogo: async (file: File): Promise<{ logo_url: string; public_id: string }> => {
    const token = authLocalStorage.getToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${API_URL}/vendor/logo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadVendorStorefront: async (file: File): Promise<{ storefront_image_url: string; public_id: string }> => {
    const token = authLocalStorage.getToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${API_URL}/vendor/storefront-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
