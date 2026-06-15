import axios from "axios";
import { FAST_API } from "../config/env";

/**
 * Cliente HTTP del backend 2 (FastAPI — analítica e inteligencia).
 * Endpoints disponibles:
 *   GET  /analytics/vendor/:id/summary
 *   GET  /analytics/vendor/:id/daily?days=N
 *   POST /delivery-time/estimate
 *   POST /fraud/analyze
 *   POST /sentiment/analyze
 *   GET  /sentiment/vendor/:id/report
 */
export const intelligenceApi = axios.create({
  baseURL: FAST_API,
  timeout: 15000,
});

// ─────────── Tipos ───────────

export interface VendorSummary {
  vendor_id: number;
  total_orders: number;
  total_revenue: number;
  avg_ticket: number;
  avg_delivery_minutes?: number | null;
  completion_rate?: number | null;
}

export interface DailyStat {
  date: string;
  orders: number;
  revenue: number;
}

export interface DeliveryEstimate {
  estimated_minutes: number;
  confidence?: number;
}

export interface FraudScore {
  risk: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  reasons?: string[];
}

export interface SentimentAnalysis {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  score: number;
  language?: string;
}

export interface SentimentReport {
  vendor_id: number;
  total_reviews: number;
  positive: number;
  neutral: number;
  negative: number;
}

// ─────────── Llamadas ───────────

export const intelligenceEndpoints = {
  vendorSummary: async (vendorId: number): Promise<VendorSummary> => {
    const res = await intelligenceApi.get(`/analytics/vendor/${vendorId}/summary`);
    return res.data;
  },

  vendorDaily: async (vendorId: number, days = 30): Promise<DailyStat[]> => {
    const res = await intelligenceApi.get(`/analytics/vendor/${vendorId}/daily`, { params: { days } });
    return res.data;
  },

  estimateDelivery: async (params: { distance_km: number; hour?: number }): Promise<DeliveryEstimate> => {
    const res = await intelligenceApi.post("/delivery-time/estimate", params);
    return res.data;
  },

  analyzeFraud: async (params: { user_id: number; amount: number; items_count: number }): Promise<FraudScore> => {
    const res = await intelligenceApi.post("/fraud/analyze", params);
    return res.data;
  },

  analyzeSentiment: async (text: string): Promise<SentimentAnalysis> => {
    const res = await intelligenceApi.post("/sentiment/analyze", { text });
    return res.data;
  },

  sentimentReport: async (vendorId: number): Promise<SentimentReport> => {
    const res = await intelligenceApi.get(`/sentiment/vendor/${vendorId}/report`);
    return res.data;
  },
};
