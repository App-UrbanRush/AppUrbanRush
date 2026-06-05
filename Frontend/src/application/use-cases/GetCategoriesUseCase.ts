import type { ICategoryRepository, Category } from "../../domain/interfaces/ICategoryRepository";

export interface GetCategoriesUseCaseResult {
  productCategories: string[];
  categories: Category[];
}

export class GetCategoriesUseCase {
  constructor(
    private readonly getVendorProducts: () => Promise<{ category: string }[]>,
    private readonly categoryRepository: ICategoryRepository,
    private readonly vendorId: number,
  ) {}

  async execute(): Promise<GetCategoriesUseCaseResult> {
    const products = await this.getVendorProducts();
    const productCategories = [...new Set(products.map((p) => p.category))];
    const categories = await this.categoryRepository.getCategoriesByVendor(this.vendorId);
    return { productCategories, categories };
  }
}
