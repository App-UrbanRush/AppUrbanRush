import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

export class AcceptOrderUseCase {
  constructor(private readonly repo: ICourierOrdersRepository) {}

  async execute(orderId: string, courierId: number): Promise<CourierOrder> {
    return this.repo.acceptOrder(orderId, courierId);
  }
}