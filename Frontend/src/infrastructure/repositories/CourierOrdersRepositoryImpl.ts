import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";
import { courierOrdersApi } from "../api/courierOrdersApi";

export class CourierOrdersRepositoryImpl implements ICourierOrdersRepository {
  async getByCourier(courierId: number): Promise<CourierOrder[]> {
    return courierOrdersApi.getByCourier(courierId);
  }

  async getAvailable(): Promise<CourierOrder[]> {
    return courierOrdersApi.getAvailable();
  }

  async updateStatus(
    orderId: string,
    status: "IN_DELIVERY" | "DELIVERED",
    courierId: number,
  ): Promise<CourierOrder> {
    return courierOrdersApi.updateStatus(orderId, status, courierId);
  }
}
