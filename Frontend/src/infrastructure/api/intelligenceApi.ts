import axios from "axios";

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_BASE_URL || "http://localhost:8000";

export interface CongruenceResult {
  congruent: boolean;
  text_sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  rating_sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
}

export const intelligenceApi = {
  checkCongruence: async (rating: number, comment: string): Promise<CongruenceResult> => {
    const res = await axios.post<CongruenceResult>(
      `${FASTAPI_URL}/sentiment/check-congruence`,
      { rating, comment }
    );
    return res.data;
  },
};
