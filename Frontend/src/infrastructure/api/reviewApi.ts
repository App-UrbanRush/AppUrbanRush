import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { Review, ReviewStats } from "../../domain/types/review.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const reviewApi = {
  getReviews: async (): Promise<Review[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<Review[]>(`${API_URL}/vendor/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getReviewStats: async (): Promise<ReviewStats> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get<ReviewStats>(`${API_URL}/vendor/reviews/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};