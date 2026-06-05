import { Injectable, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../domain/repositories/review.repository.interface';
import { ReviewModel } from '../../domain/entities/review.model';

@Injectable()
export class GetVendorReviewsUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(vendorId: number): Promise<ReviewModel[]> {
    return this.reviewRepository.findByVendorId(vendorId);
  }
}