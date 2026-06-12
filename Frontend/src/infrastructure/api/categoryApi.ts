import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { Category } from "../../domain/interfaces/ICategoryRepository";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const categoryApi = {
  getCategoriesByVendor: async (vendorId: number): Promise<Category[]> => {
    const token = authLocalStorage.getToken();
    console.log(`📡 Fetching categories for vendor ${vendorId}`);
    try {
      const response = await axios.get<Category[]>(`${API_URL}/categories/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Categories loaded:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching categories:`, error);
      throw error;
    }
  },

  createCategory: async (vendorId: number, name: string, imageUrl: string): Promise<Category> => {
    const token = authLocalStorage.getToken();
    console.log(`📡 Creating category: ${name} for vendor ${vendorId}`);
    try {
      const response = await axios.post<Category>(`${API_URL}/categories`, {
        vendor_id: vendorId,
        name,
        image_url: imageUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Category created:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error creating category:`, error);
      throw error;
    }
  },

  updateCategory: async (id: string, data: { name?: string; image_url?: string }): Promise<Category> => {
    const token = authLocalStorage.getToken();
    console.log(`📡 Updating category ${id}:`, data);
    try {
      const response = await axios.put<Category>(`${API_URL}/categories/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Category updated:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating category:`, error);
      throw error;
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    const token = authLocalStorage.getToken();
    await axios.delete(`${API_URL}/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
