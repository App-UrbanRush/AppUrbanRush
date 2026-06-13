export interface Category {
  category_id: string;
  vendor_id: number;
  name: string;
  image_url: string;
}

export interface ICategoryRepository {
  getMyCategories(): Promise<Category[]>;
  getCategoriesByVendor(vendorId: number): Promise<Category[]>;
  createCategory(vendorId: number, name: string, imageUrl: string): Promise<Category>;
  updateCategory(id: string, data: { name?: string; image_url?: string }): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}
