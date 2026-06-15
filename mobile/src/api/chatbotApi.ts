import axios from "axios";
import { NEST_API } from "../config/env";

export type UserAudience = "GUEST" | "CUSTOMER" | "COURIER" | "VENDOR" | "ADMIN";

export interface ChatResponse {
  reply: string;
  intent: string;
  confidence: number;
  quickReplies?: { label: string; value: string }[];
  actions?: { label: string; type: "NAVIGATE" | "OPEN_MODAL"; target: string }[];
}

export const chatbotApi = {
  ask: async (text: string, context: { audience: UserAudience; userId?: number; userName?: string }): Promise<ChatResponse> => {
    const res = await axios.post(`${NEST_API}/chatbot/ask`, { text, context });
    return res.data;
  },
};
