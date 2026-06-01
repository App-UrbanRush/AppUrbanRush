import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';

@Injectable()
export class GetProductsByVendorUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(vendorId: number) {
    return this.productRepository.findByVendor(vendorId);
  }
}