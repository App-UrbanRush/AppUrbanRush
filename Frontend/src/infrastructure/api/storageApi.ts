import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { UploadResult } from "../../domain/interfaces/IStorageRepository";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const storageApi = {
  uploadImage: async (file: File, folder: string): Promise<UploadResult> => {
    const token = authLocalStorage.getToken();
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await axios.post<UploadResult>(`${API_URL}/storage/image`, formData, {
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

    const response = await axios.post<{ image_url: string; public_id: string }>(
      `${API_URL}/products/${productId}/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  deleteImage: async (publicId: string): Promise<void> => {
    const token = authLocalStorage.getToken();
    await axios.delete(`${API_URL}/storage/image/${encodeURIComponent(publicId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
