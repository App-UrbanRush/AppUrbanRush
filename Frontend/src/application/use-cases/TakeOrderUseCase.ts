import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

/**
 * El domiciliario toma un pedido READY: pasa a IN_DELIVERY y se asigna a él.
 */
export class TakeOrderUseCase {
  constructor(private readonly repo: ICourierOrdersRepository) {}

  async execute(orderId: string, courierId: number): Promise<CourierOrder> {
    return this.repo.updateStatus(orderId, "IN_DELIVERY", courierId);
  }
}
