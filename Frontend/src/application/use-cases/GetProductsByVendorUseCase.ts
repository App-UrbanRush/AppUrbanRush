import type { Product } from "../../domain/types/product.types";
import type { IProductRepository } from "../../domain/interfaces/IProductRepository";

export class GetProductsByVendorUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(vendorId: number): Promise<Product[]> {
    return this.productRepository.getProductsByVendor(vendorId);
  }
}