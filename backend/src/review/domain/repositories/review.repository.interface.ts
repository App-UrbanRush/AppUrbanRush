import { ReviewModel } from '../entities/review.model';

export interface IReviewRepository {
  findByVendorId(vendorId: number): Promise<ReviewModel[]>;
  findStatsByVendorId(vendorId: number): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  }>;
}