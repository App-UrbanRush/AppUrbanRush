import type { ProductPerformance } from "../../domain/types/product-performance.types";

export interface IProductPerformanceRepository {
  getProductPerformance(limit?: number, days?: number): Promise<ProductPerformance[]>;
}