import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { UpdateProductDto } from '../dtos/update-product.dto';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto) {
    const updated = await this.productRepository.update(id, dto);
    if (!updated) throw new NotFoundException('Producto no encontrado');
    return updated;
  }
}