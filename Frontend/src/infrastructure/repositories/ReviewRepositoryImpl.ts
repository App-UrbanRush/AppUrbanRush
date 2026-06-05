import type { Review, ReviewStats } from "../../domain/types/review.types";
import { reviewApi } from "../../infrastructure/api/reviewApi";

export interface IReviewRepository {
  getReviews(): Promise<Review[]>;
  getReviewStats(): Promise<ReviewStats>;
}

export class ReviewRepositoryImpl implements IReviewRepository {
  async getReviews(): Promise<Review[]> {
    return reviewApi.getReviews();
  }

  async getReviewStats(): Promise<ReviewStats> {
    return reviewApi.getReviewStats();
  }
}