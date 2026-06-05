import type { ProductPerformance } from "../../domain/types/product-performance.types";
import type { IProductPerformanceRepository } from "../../domain/interfaces/IProductPerformanceRepository";

export class GetProductPerformanceUseCase {
  constructor(private readonly productPerformanceRepository: IProductPerformanceRepository) {}

  async execute(limit?: number, days?: number): Promise<ProductPerformance[]> {
    return this.productPerformanceRepository.getProductPerformance(limit, days);
  }
}