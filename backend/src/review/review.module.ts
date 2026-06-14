import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review, ReviewSchema } from './infrastructure/schemas/review.schema';
import { MongoReviewRepository } from './infrastructure/repositories/mongo-review.repository';
import { GetVendorReviewsUseCase } from './application/use-cases/get-vendor-reviews.use-case';
import { GetVendorReviewStatsUseCase } from './application/use-cases/get-vendor-review-stats.use-case';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case';
import { DeleteReviewUseCase } from './application/use-cases/delete-review.use-case';
import { ReviewController } from './infrastructure/controllers/review.controller';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { TypeOrmVendorRepository } from 'src/vendor/infrastructure/persistence/repositories/typeorm-vendor.repository';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    TypeOrmModule.forFeature([PeopleEntity, VendorEntity]),
    forwardRef(() => OrderModule),
  ],
  controllers: [ReviewController],
  providers: [
    MongoReviewRepository,
    { provide: 'IReviewRepository', useClass: MongoReviewRepository },
    TypeOrmVendorRepository,
    { provide: 'IVendorRepository', useClass: TypeOrmVendorRepository },
    GetVendorReviewsUseCase,
    GetVendorReviewStatsUseCase,
    CreateReviewUseCase,
    DeleteReviewUseCase,
  ],
  exports: ['IReviewRepository'],
})
export class ReviewModule {}