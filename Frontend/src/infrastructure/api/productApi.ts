import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { Product } from "../../domain/types/product.types";
import type { CreateProductData, UpdateProductData } from "../../domain/interfaces/IProductRepository";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const productApi = {
  getProductsByVendor: async (vendorId: number): Promise<Product[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<Product[]>(`${API_URL}/products/vendor/${vendorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    const token = authLocalStorage.getToken();
    const response = await axios.post<Product>(`${API_URL}/products`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateProduct: async (productId: string, data: UpdateProductData): Promise<Product> => {
    const token = authLocalStorage.getToken();
    const response = await axios.put<Product>(`${API_URL}/products/${productId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<void> => {
    const token = authLocalStorage.getToken();
    await axios.delete(`${API_URL}/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};