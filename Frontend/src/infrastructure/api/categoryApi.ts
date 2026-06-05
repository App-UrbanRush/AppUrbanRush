import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { Category } from "../../domain/interfaces/ICategoryRepository";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const categoryApi = {
  getCategoriesByVendor: async (vendorId: number): Promise<Category[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<Category[]>(`${API_URL}/categories/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  createCategory: async (vendorId: number, name: string, imageUrl: string): Promise<Category> => {
    const token = authLocalStorage.getToken();
    const response = await axios.post<Category>(`${API_URL}/categories`, {
      vendor_id: vendorId,
      name,
      image_url: imageUrl,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateCategory: async (id: string, data: { name?: string; image_url?: string }): Promise<Category> => {
    const token = authLocalStorage.getToken();
    const response = await axios.put<Category>(`${API_URL}/categories/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const token = authLocalStorage.getToken();
    await axios.delete(`${API_URL}/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
