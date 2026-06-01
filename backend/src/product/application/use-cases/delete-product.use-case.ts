import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    await this.productRepository.delete(id);
    return { message: 'Producto eliminado correctamente' };
  }
}