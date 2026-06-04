import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';
import { IProductRepository } from 'src/product/domain/repositories/product.repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
    @Inject('IProductRepository')
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(productId: string, file: Express.Multer.File) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Si ya tiene imagen, eliminar la anterior
    if (product.image_url) {
      const oldPublicId = this.extractPublicId(product.image_url);
      if (oldPublicId) await this.storageRepo.deleteImage(oldPublicId).catch(() => {});
    }

    const filename = `product-${productId}-${randomUUID()}`;
    const result = await this.storageRepo.uploadImage(file.buffer, 'products', filename);

    await this.productRepo.update(productId, { image_url: result.secure_url });

    return { image_url: result.secure_url, public_id: result.public_id };
  }

  private extractPublicId(url: string): string | null {
    const match = url.match(/urbanrush\/[\w\-/]+/);
    return match ? match[0] : null;
  }
}
