import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { ProductPerformance } from "../../domain/types/product-performance.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const productPerformanceApi = {
  getProductPerformance: async (vendorId: number, limit: number = 5, days: number = 7): Promise<ProductPerformance[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<ProductPerformance[]>(
      `${API_URL}/products/vendor/${vendorId}/performance?limit=${limit}&days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
};