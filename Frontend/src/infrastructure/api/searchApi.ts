import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const auth = () => ({ headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` } });

export interface SearchEntry {
  id: number | string;
  type: "VENDOR" | "PRODUCT";
  name: string;
  normalized: string;
  vendorId?: number;
}

/** Wrapper del endpoint REST /search (índice AVL en memoria). */
export const searchApi = {
  search: async (q: string, limit = 20): Promise<SearchEntry[]> => {
    const res = await axios.get(`${API_URL}/search`, {
      ...auth(),
      params: { q, limit },
    });
    return res.data;
  },

  stats: async (): Promise<{ size: number; lastBuildAt: string | null }> => {
    const res = await axios.get(`${API_URL}/search/stats`, auth());
    return res.data;
  },

  rebuild: async (): Promise<{ size: number; ms: number }> => {
    const res = await axios.post(`${API_URL}/search/rebuild`, {}, auth());
    return res.data;
  },
};
