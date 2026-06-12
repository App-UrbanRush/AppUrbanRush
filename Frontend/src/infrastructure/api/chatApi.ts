import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { ChatMessage } from "../../domain/types/chat.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
});

export const chatApi = {
  getHistory: async (orderId: string): Promise<ChatMessage[]> => {
    const res = await axios.get(`${API_URL}/chat/order/${orderId}`, authHeader());
    return res.data;
  },

  markRead: async (orderId: string): Promise<void> => {
    await axios.patch(`${API_URL}/chat/order/${orderId}/read`, {}, authHeader());
  },

  getUnreadCount: async (orderId: string): Promise<number> => {
    const res = await axios.get(`${API_URL}/chat/unread-count/${orderId}`, authHeader());
    return res.data?.unread ?? 0;
  },
};
