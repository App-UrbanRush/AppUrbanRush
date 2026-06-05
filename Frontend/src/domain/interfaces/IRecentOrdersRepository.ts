import type { RecentOrder } from "../../domain/types/recent-orders.types";

export interface IRecentOrdersRepository {
  getRecentOrders(): Promise<RecentOrder[]>;
  getAllVendorOrders(vendorId: number): Promise<RecentOrder[]>;
}