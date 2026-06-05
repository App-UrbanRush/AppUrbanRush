import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review, ReviewSchema } from './infrastructure/schemas/review.schema';
import { MongoReviewRepository } from './infrastructure/repositories/mongo-review.repository';
import { GetVendorReviewsUseCase } from './application/use-cases/get-vendor-reviews.use-case';
import { GetVendorReviewStatsUseCase } from './application/use-cases/get-vendor-review-stats.use-case';
import { ReviewController } from './infrastructure/controllers/review.controller';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    TypeOrmModule.forFeature([PeopleEntity]),
  ],
  controllers: [ReviewController],
  providers: [
    MongoReviewRepository,
    { provide: 'IReviewRepository', useClass: MongoReviewRepository },
    GetVendorReviewsUseCase,
    GetVendorReviewStatsUseCase,
  ],
  exports: ['IReviewRepository'],
})
export class ReviewModule {}