import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CategoryModel } from '../../domain/entities/category.model';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, data: { name?: string; image_url?: string }): Promise<CategoryModel> {
    const updated = await this.categoryRepository.update(id, data);
    if (!updated) {
      throw new Error('Categoría no encontrada');
    }
    return updated;
  }
}
