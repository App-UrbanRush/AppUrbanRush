import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CategoryModel } from '../../domain/entities/category.model';

@Injectable()
export class GetCategoriesByVendorUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(vendorId: number): Promise<CategoryModel[]> {
    return this.categoryRepository.findByVendor(vendorId);
  }
}
