import type { ICategoryRepository } from "../../domain/interfaces/ICategoryRepository";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(categoryId: string): Promise<void> {
    return this.categoryRepository.deleteCategory(categoryId);
  }
}
