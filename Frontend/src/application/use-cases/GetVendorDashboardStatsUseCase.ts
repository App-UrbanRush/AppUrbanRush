import type { VendorDashboardStats } from "../../domain/types/vendor-dashboard.types";
import type { IVendorDashboardRepository } from "../../domain/interfaces/IVendorDashboardRepository";

export class GetVendorDashboardStatsUseCase {
  constructor(private readonly vendorDashboardRepository: IVendorDashboardRepository) {}

  async execute(): Promise<VendorDashboardStats> {
    return this.vendorDashboardRepository.getDashboardStats();
  }
}