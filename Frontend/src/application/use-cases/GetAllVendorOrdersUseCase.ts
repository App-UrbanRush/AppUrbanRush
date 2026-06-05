import type { RecentOrder } from "../../domain/types/recent-orders.types";
import type { IRecentOrdersRepository } from "../../domain/interfaces/IRecentOrdersRepository";

export class GetAllVendorOrdersUseCase {
  constructor(private readonly recentOrdersRepository: IRecentOrdersRepository) {}

  async execute(vendorId: number): Promise<RecentOrder[]> {
    return this.recentOrdersRepository.getAllVendorOrders(vendorId);
  }
}
