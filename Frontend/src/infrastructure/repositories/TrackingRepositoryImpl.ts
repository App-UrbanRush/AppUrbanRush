import type { ITrackingRepository } from "../../domain/interfaces/ITrackingRepository";
import type { OrderTracking } from "../../domain/types/tracking.types";
import { trackingApi } from "../api/trackingApi";

export class TrackingRepositoryImpl implements ITrackingRepository {
  async getOrderTracking(orderId: string): Promise<OrderTracking> {
    return trackingApi.getOrderTracking(orderId);
  }
}
