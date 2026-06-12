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

  uploadProductImage: async (productId: string, file: File): Promise<{ image_url: string; public_id: string }> => {
    const token = authLocalStorage.getToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${API_URL}/products/${productId}/image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadCourierPhoto: async (file: File): Promise<{ photo_url: string; public_id: string }> => {
    const token = authLocalStorage.getToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${API_URL}/courier/photo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
