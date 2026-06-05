import type { RecentOrder } from "../../domain/types/recent-orders.types";
import type { IRecentOrdersRepository } from "../../domain/interfaces/IRecentOrdersRepository";

export class GetVendorRecentOrdersUseCase {
  constructor(private readonly recentOrdersRepository: IRecentOrdersRepository) {}

  async execute(): Promise<RecentOrder[]> {
    return this.recentOrdersRepository.getRecentOrders();
  }
}