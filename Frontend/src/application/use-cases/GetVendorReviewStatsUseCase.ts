import type { ReviewStats } from "../../domain/types/review.types";
import type { IReviewRepository } from "../../domain/interfaces/IReviewRepository";

export class GetVendorReviewStatsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(): Promise<ReviewStats> {
    return this.reviewRepository.getReviewStats();
  }
}