import type { VendorDashboardStats } from "../../domain/types/vendor-dashboard.types";
import type { IVendorDashboardRepository } from "../../domain/interfaces/IVendorDashboardRepository";
import { vendorDashboardApi } from "../../infrastructure/api/vendorDashboardApi";
import { authLocalStorage } from "../persistence/authLocalStorage";

export class VendorDashboardRepositoryImpl implements IVendorDashboardRepository {
  async getDashboardStats(): Promise<VendorDashboardStats> {
    const token = authLocalStorage.getToken();
    if (!token) {
      throw new Error("No hay token de autenticación");
    }
    return vendorDashboardApi.getDashboardStats(token);
  }
}