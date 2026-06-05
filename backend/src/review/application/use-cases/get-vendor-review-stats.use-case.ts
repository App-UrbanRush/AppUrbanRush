import { Injectable, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../domain/repositories/review.repository.interface';

@Injectable()
export class GetVendorReviewStatsUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(vendorId: number): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  }> {
    return this.reviewRepository.findStatsByVendorId(vendorId);
  }
}