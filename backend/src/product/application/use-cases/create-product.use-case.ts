import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { CreateProductDto } from '../dtos/create-product.dto';
import { ProductModel } from '../../domain/entities/product.model';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductModel> {
    const product = new ProductModel(
      null,
      dto.vendor_id,
      dto.name,
      dto.description,
      dto.price,
      dto.image_url ?? null,
      dto.category,
      true,
      dto.stock ?? 0,
    );
    return this.productRepository.create(product);
  }
}