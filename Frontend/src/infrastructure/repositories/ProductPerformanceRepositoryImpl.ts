import type { ProductPerformance } from "../../domain/types/product-performance.types";
import { productPerformanceApi } from "../../infrastructure/api/productPerformanceApi";
import { authLocalStorage } from "../persistence/authLocalStorage";
import { decodeJwt } from "../utils/jwtDecoder";

export interface IProductPerformanceRepository {
  getProductPerformance(limit?: number, days?: number): Promise<ProductPerformance[]>;
}

export class ProductPerformanceRepositoryImpl implements IProductPerformanceRepository {
  async getProductPerformance(limit: number = 5, days: number = 7): Promise<ProductPerformance[]> {
    const token = authLocalStorage.getToken();
    if (!token) return [];
    const payload = decodeJwt(token);
    if (!payload) return [];
    const vendorId = payload.user_id;
    return productPerformanceApi.getProductPerformance(vendorId, limit, days);
  }
}