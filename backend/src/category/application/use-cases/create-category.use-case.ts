import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CategoryModel } from '../../domain/entities/category.model';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(vendorId: number, name: string, imageUrl: string = ''): Promise<CategoryModel> {
    const existing = await this.categoryRepository.findByNameAndVendor(name, vendorId);
    if (existing) {
      throw new ConflictException('Esta categoría ya existe');
    }

    const category = new CategoryModel(null, vendorId, name, imageUrl);
    return this.categoryRepository.create(category);
  }
}
