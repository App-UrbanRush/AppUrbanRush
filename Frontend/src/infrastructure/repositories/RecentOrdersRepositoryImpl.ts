import type { RecentOrder } from "../../domain/types/recent-orders.types";
import type { IRecentOrdersRepository } from "../../domain/interfaces/IRecentOrdersRepository";
import { recentOrdersApi } from "../../infrastructure/api/recentOrdersApi";

export class RecentOrdersRepositoryImpl implements IRecentOrdersRepository {
  async getRecentOrders(): Promise<RecentOrder[]> {
    return recentOrdersApi.getRecentOrders();
  }

  async getAllVendorOrders(vendorId: number): Promise<RecentOrder[]> {
    return recentOrdersApi.getAllVendorOrders(vendorId);
  }
}