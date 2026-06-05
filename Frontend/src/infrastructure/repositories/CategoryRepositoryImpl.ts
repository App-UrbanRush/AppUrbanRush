import type { Category, ICategoryRepository } from "../../domain/interfaces/ICategoryRepository";
import { categoryApi } from "../api/categoryApi";

export class CategoryRepositoryImpl implements ICategoryRepository {
  async getCategoriesByVendor(vendorId: number): Promise<Category[]> {
    return categoryApi.getCategoriesByVendor(vendorId);
  }

  async createCategory(vendorId: number, name: string, imageUrl: string): Promise<Category> {
    return categoryApi.createCategory(vendorId, name, imageUrl);
  }

  async updateCategory(id: string, data: { name?: string; image_url?: string }): Promise<Category> {
    return categoryApi.updateCategory(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    return categoryApi.deleteCategory(id);
  }
}
