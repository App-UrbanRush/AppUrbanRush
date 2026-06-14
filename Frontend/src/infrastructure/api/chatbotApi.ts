import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type UserAudience = "GUEST" | "CUSTOMER" | "COURIER" | "VENDOR" | "ADMIN";

export interface ChatContext {
  audience: UserAudience;
  userId?: number;
  userName?: string;
  activeOrderId?: string;
  recentMessages?: { from: "user" | "bot"; text: string }[];
}

export interface QuickReply { label: string; value: string; }
export interface ChatAction { label: string; type: "NAVIGATE" | "OPEN_MODAL"; target: string; }

export interface ChatResponse {
  reply: string;
  intent: string;
  confidence: number;
  quickReplies?: QuickReply[];
  actions?: ChatAction[];
  data?: Record<string, unknown>;
}

export const chatbotApi = {
  ask: async (text: string, context: ChatContext): Promise<ChatResponse> => {
    const res = await axios.post(`${API_URL}/chatbot/ask`, { text, context });
    return res.data;
  },
};
