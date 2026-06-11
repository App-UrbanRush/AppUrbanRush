import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";
import { courierOrdersApi } from "../api/courierOrdersApi";

export class CourierOrdersRepositoryImpl implements ICourierOrdersRepository {
  async getByCourier(courierId: number): Promise<CourierOrder[]> {
    return courierOrdersApi.getByCourier(courierId);
  }
}
