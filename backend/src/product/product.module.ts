import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './infrastructure/schemas/product.schema';
import { MongoProductRepository } from './infrastructure/repositories/mongo-product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetProductsByVendorUseCase } from './application/use-cases/get-products-by-vendor.use-case';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { GetProductPerformanceUseCase } from './application/use-cases/get-product-performance.use-case';
import { ProductController } from './infrastructure/controllers/product.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [
    MongoProductRepository,
    { provide: 'IProductRepository', useClass: MongoProductRepository },
    CreateProductUseCase,
    GetProductsByVendorUseCase,
    GetAllProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductPerformanceUseCase,
  ],
  exports: ['IProductRepository'],
})
export class ProductModule {}