import type { VendorDashboardStats } from "../types/vendor-dashboard.types";

export interface IVendorDashboardRepository {
  getDashboardStats(): Promise<VendorDashboardStats>;
}