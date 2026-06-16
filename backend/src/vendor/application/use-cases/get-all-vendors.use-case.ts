import { Inject, Injectable } from '@nestjs/common';
import { IVendorRepository } from '../../domain/repositories/vendor.repository';
import { IProductRepository } from '../../../product/domain/repositories/product.repository.interface';
import { IReviewRepository } from '../../../review/domain/repositories/review.repository.interface';

@Injectable()
export class GetAllVendorsUseCase {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute() {
    const vendors = await this.vendorRepository.findAll();

    const enriched = await Promise.all(
      vendors.map(async (vendor) => {
        const vendorId = vendor.vendor_id!;
        const [products, reviewStats] = await Promise.all([
          this.productRepository.findByVendor(vendorId),
          this.reviewRepository.findStatsByVendorId(vendorId),
        ]);

        return {
          ...vendor,
          product_count: products.length,
          average_rating: reviewStats.average_rating,
          total_reviews: reviewStats.total_reviews,
          rating_distribution: reviewStats.rating_distribution,
        };
      }),
    );

    return enriched;
  }
}
