import type { OrderTracking } from "../types/tracking.types";

/**
 * Contrato del fallback REST (sin tiempo real).
 * Implementado por TrackingRepositoryImpl sobre axios.
 */
export interface ITrackingRepository {
  getOrderTracking(orderId: string): Promise<OrderTracking>;
}
