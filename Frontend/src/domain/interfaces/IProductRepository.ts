import type { Product } from "../../domain/types/product.types";

export interface CreateProductData {
  vendor_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  stock?: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  stock?: number;
}

export interface IProductRepository {
  getProductsByVendor(vendorId: number): Promise<Product[]>;
  createProduct(data: CreateProductData): Promise<Product>;
  updateProduct(productId: string, data: UpdateProductData): Promise<Product>;
  deleteProduct(productId: string): Promise<void>;
}