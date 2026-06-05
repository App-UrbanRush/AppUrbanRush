import type { Product } from "../../domain/types/product.types";
import type { IProductRepository, CreateProductData } from "../../domain/interfaces/IProductRepository";

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(data: CreateProductData): Promise<Product> {
    return this.productRepository.createProduct(data);
  }
}
