import type { Product } from "../../domain/types/product.types";
import type { IProductRepository, UpdateProductData } from "../../domain/interfaces/IProductRepository";

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(productId: string, data: UpdateProductData): Promise<Product> {
    return this.productRepository.updateProduct(productId, data);
  }
}
