import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

/**
 * El domiciliario marca un pedido IN_DELIVERY como DELIVERED (entregado).
 */
export class MarkOrderDeliveredUseCase {
  constructor(private readonly repo: ICourierOrdersRepository) {}

  async execute(orderId: string, courierId: number): Promise<CourierOrder> {
    return this.repo.updateStatus(orderId, "DELIVERED", courierId);
  }
}
