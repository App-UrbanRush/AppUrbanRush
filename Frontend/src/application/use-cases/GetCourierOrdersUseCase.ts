import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

export class GetCourierOrdersUseCase {
  constructor(private readonly repo: ICourierOrdersRepository) {}

  async execute(courierId: number): Promise<CourierOrder[]> {
    return this.repo.getByCourier(courierId);
  }
}
