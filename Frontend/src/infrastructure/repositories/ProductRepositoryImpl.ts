import type { Product } from "../../domain/types/product.types";
import type { IProductRepository, CreateProductData, UpdateProductData } from "../../domain/interfaces/IProductRepository";
import { productApi } from "../../infrastructure/api/productApi";

export class ProductRepositoryImpl implements IProductRepository {
  async getProductsByVendor(vendorId: number): Promise<Product[]> {
    return productApi.getProductsByVendor(vendorId);
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    return productApi.createProduct(data);
  }

  async updateProduct(productId: string, data: UpdateProductData): Promise<Product> {
    return productApi.updateProduct(productId, data);
  }

  async deleteProduct(productId: string): Promise<void> {
    return productApi.deleteProduct(productId);
  }
}