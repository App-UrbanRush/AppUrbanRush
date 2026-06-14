import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { Review, ReviewStats } from "../../domain/types/review.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const reviewApi = {
  getReviews: async (): Promise<Review[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<Review[]>(`${API_URL}/vendor/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getReviewStats: async (): Promise<ReviewStats> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<ReviewStats>(`${API_URL}/vendor/reviews/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getByStore: async (vendorId: number): Promise<Review[]> => {
    const response = await axios.get<Review[]>(`${API_URL}/stores/${vendorId}/reviews`);
    return response.data;
  },

  getStatsByStore: async (vendorId: number): Promise<ReviewStats> => {
    const response = await axios.get<ReviewStats>(`${API_URL}/stores/${vendorId}/reviews/stats`);
    return response.data;
  },

  create: async (data: { vendor_id: number; order_id?: string; rating: number; comment?: string }) => {
    const token = authLocalStorage.getToken();
    const response = await axios.post(`${API_URL}/reviews`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  remove: async (reviewId: string) => {
    const token = authLocalStorage.getToken();
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};