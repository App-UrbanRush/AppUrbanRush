import type { CourierOrder } from "../types/courier-orders.types";

export interface ICourierOrdersRepository {
  getByCourier(courierId: number): Promise<CourierOrder[]>;
  getAvailable(): Promise<CourierOrder[]>;
  updateStatus(
    orderId: string,
    status: "IN_DELIVERY" | "DELIVERED",
    courierId: number,
  ): Promise<CourierOrder>;
}
