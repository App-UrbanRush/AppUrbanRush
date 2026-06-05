import type { Review } from "../../domain/types/review.types";
import type { IReviewRepository } from "../../domain/interfaces/IReviewRepository";

export class GetVendorReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(): Promise<Review[]> {
    return this.reviewRepository.getReviews();
  }
}