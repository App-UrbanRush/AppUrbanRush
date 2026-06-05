import type { Review, ReviewStats } from "../../domain/types/review.types";

export interface IReviewRepository {
  getReviews(): Promise<Review[]>;
  getReviewStats(): Promise<ReviewStats>;
}