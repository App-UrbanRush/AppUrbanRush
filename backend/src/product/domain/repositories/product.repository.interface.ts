import { ProductModel } from '../entities/product.model';

export interface IProductRepository {
  create(product: ProductModel): Promise<ProductModel>;
  findById(id: string): Promise<ProductModel | null>;
  findByVendor(vendorId: number): Promise<ProductModel[]>;
  findAll(): Promise<ProductModel[]>;
  update(id: string, product: Partial<ProductModel>): Promise<ProductModel | null>;
  delete(id: string): Promise<void>;
}