import type { CourierOrder } from "../types/courier-orders.types";

export interface ICourierOrdersRepository {
  getByCourier(courierId: number): Promise<CourierOrder[]>;
}
