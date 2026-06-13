import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './infrastructure/schemas/category.schema';
import { MongoCategoryRepository } from './infrastructure/repositories/mongo-category.repository';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { GetCategoriesByVendorUseCase } from './application/use-cases/get-categories-by-vendor.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { CategoryController } from './infrastructure/controllers/category.controller';
import { ProductModule } from 'src/product/product.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { GetVendorProfileUseCase } from 'src/vendor/application/use-cases/get-vendor-profile.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    ProductModule,
    VendorModule,
  ],
  controllers: [CategoryController],
  providers: [
    MongoCategoryRepository,
    { provide: 'ICategoryRepository', useClass: MongoCategoryRepository },
    CreateCategoryUseCase,
    GetCategoriesByVendorUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    GetVendorProfileUseCase,
  ],
  exports: ['ICategoryRepository'],
})
export class CategoryModule {}
