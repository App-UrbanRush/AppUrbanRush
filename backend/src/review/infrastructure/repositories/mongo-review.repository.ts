import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { ReviewModel } from '../../domain/entities/review.model';
import { IReviewRepository } from '../../domain/repositories/review.repository.interface';

@Injectable()
export class MongoReviewRepository implements IReviewRepository {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async findByVendorId(vendorId: number): Promise<ReviewModel[]> {
    const reviews = await this.reviewModel
      .find({ vendor_id: vendorId })
      .sort({ created_at: -1 })
      .exec();

    return reviews.map(
      (doc) =>
        new ReviewModel(
          doc._id.toString(),
          doc.vendor_id,
          doc.user_id,
          doc.order_id || null,
          doc.rating,
          doc.comment,
          doc.created_at,
        ),
    );
  }

  async findStatsByVendorId(vendorId: number): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  }> {
    const reviews = await this.reviewModel.find({ vendor_id: vendorId }).exec();

    const total_reviews = reviews.length;
    if (total_reviews === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    // Calcular promedio
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average_rating = sum / total_reviews;

    // Calcular distribución
    const rating_distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      rating_distribution[review.rating] = (rating_distribution[review.rating] || 0) + 1;
    });

    return {
      average_rating: Math.round(average_rating * 10) / 10, // Redondear a 1 decimal
      total_reviews,
      rating_distribution,
    };
  }
}