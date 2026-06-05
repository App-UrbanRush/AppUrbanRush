import type { IProductRepository } from "../../domain/interfaces/IProductRepository";

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(productId: string): Promise<void> {
    return this.productRepository.deleteProduct(productId);
  }
}
