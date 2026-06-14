import { ReviewModel } from '../entities/review.model';

export interface IReviewRepository {
  findByVendorId(vendorId: number): Promise<ReviewModel[]>;
  findStatsByVendorId(vendorId: number): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  }>;
  findByVendorIdAndUserId(vendorId: number, userId: number): Promise<ReviewModel | null>;
  findByOrderId(orderId: string): Promise<ReviewModel | null>;
  findById(reviewId: string): Promise<ReviewModel | null>;
  create(data: Partial<ReviewModel>): Promise<ReviewModel>;
  delete(reviewId: string): Promise<void>;
}