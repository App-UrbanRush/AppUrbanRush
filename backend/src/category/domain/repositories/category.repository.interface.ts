import { CategoryModel } from '../entities/category.model';

export interface ICategoryRepository {
  create(category: CategoryModel): Promise<CategoryModel>;
  findById(id: string): Promise<CategoryModel | null>;
  findByVendor(vendorId: number): Promise<CategoryModel[]>;
  findByNameAndVendor(name: string, vendorId: number): Promise<CategoryModel | null>;
  update(id: string, data: Partial<CategoryModel>): Promise<CategoryModel | null>;
  delete(id: string): Promise<void>;
}
