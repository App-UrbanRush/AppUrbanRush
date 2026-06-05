import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { IProductRepository } from 'src/product/domain/repositories/product.repository.interface';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(categoryId: string, vendorId: number): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (category.vendor_id !== vendorId) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const products = await this.productRepository.findByVendor(vendorId);
    const hasProducts = products.some(
      (p) => p.category.toLowerCase() === category.name.toLowerCase(),
    );

    if (hasProducts) {
      throw new BadRequestException('No se puede eliminar: existen productos en esta categoría');
    }

    await this.categoryRepository.delete(categoryId);
  }
}
