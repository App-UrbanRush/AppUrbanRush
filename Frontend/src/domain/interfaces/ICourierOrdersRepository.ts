import type { CourierOrder } from "../types/courier-orders.types";

export interface ICourierOrdersRepository {
  getByCourier(courierId: number): Promise<CourierOrder[]>;
  getAvailable(): Promise<CourierOrder[]>;
  updateStatus(
    orderId: string,
    status: "IN_DELIVERY",
    courierId: number,
  ): Promise<CourierOrder>;
  confirmDelivery(
    orderId: string,
    deliveryCode: string,
    courierId: number,
  ): Promise<CourierOrder>;
}
