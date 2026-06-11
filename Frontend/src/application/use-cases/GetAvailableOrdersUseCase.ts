import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

export class GetAvailableOrdersUseCase {
  constructor(private readonly repo: ICourierOrdersRepository) {}

  async execute(): Promise<CourierOrder[]> {
    return this.repo.getAvailable();
  }
}
