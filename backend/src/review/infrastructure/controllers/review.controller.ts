import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Inject, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetVendorReviewsUseCase } from '../../application/use-cases/get-vendor-reviews.use-case';
import { GetVendorReviewStatsUseCase } from '../../application/use-cases/get-vendor-review-stats.use-case';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case';
import { DeleteReviewUseCase } from '../../application/use-cases/delete-review.use-case';
import { ReviewMapper } from '../mappers/review.mapper';
import { IReviewRepository } from '../../domain/repositories/review.repository.interface';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';
import { CreateReviewDto } from '../../application/dtos/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';

@ApiTags('Reviews')
@Controller()
export class ReviewController {
  constructor(
    private readonly getVendorReviewsUseCase: GetVendorReviewsUseCase,
    private readonly getVendorReviewStatsUseCase: GetVendorReviewStatsUseCase,
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepository: Repository<PeopleEntity>,
  ) {}

  @Post('reviews')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una reseña para un negocio (solo si la orden fue entregada)' })
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.createReviewUseCase.execute(req.user.user_id, dto);
  }

  @Delete('reviews/:reviewId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una reseña propia' })
  async delete(@Request() req, @Param('reviewId') reviewId: string) {
    return this.deleteReviewUseCase.execute(req.user.user_id, reviewId);
  }

  @Get('stores/:vendorId/reviews')
  @ApiOperation({ summary: 'Obtener reseñas públicas de un negocio' })
  async getPublicReviews(@Param('vendorId') vendorId: number) {
    const reviews = await this.reviewRepository.findByVendorId(Number(vendorId));
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        const people = await this.peopleRepository.findOne({
          where: { user_id: review.user_id },
        });
        const user_name = people
          ? `${people.firstName} ${people.firstLastName}`
          : 'Usuario';
        const user_avatar = people?.avatar_url ?? null;
        return ReviewMapper.toResponse(review, user_name, user_avatar);
      }),
    );
    return reviewsWithUser;
  }

  @Get('stores/:vendorId/reviews/stats')
  @ApiOperation({ summary: 'Obtener estadísticas públicas de reseñas de un negocio' })
  async getPublicStats(@Param('vendorId') vendorId: number) {
    const stats = await this.reviewRepository.findStatsByVendorId(Number(vendorId));
    const total = stats.total_reviews;
    const recommended = (stats.rating_distribution[4] || 0) + (stats.rating_distribution[5] || 0);
    const recommended_percentage = total > 0 ? Math.round((recommended / total) * 100) : 0;
    return { ...stats, recommended_percentage };
  }

  @Get('vendor/reviews')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las reseñas del vendor' })
  async getReviews(@Request() req) {
    const vendor = await this.vendorRepository.findByUserId(req.user.user_id);
    if (!vendor) throw new NotFoundException('Vendedor no encontrado');

    const reviews = await this.getVendorReviewsUseCase.execute(vendor.vendor_id!);

    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        const people = await this.peopleRepository.findOne({
          where: { user_id: review.user_id },
        });
        const user_name = people
          ? `${people.firstName} ${people.firstLastName}`
          : 'Usuario';
        const user_avatar = people?.avatar_url ?? null;

        return ReviewMapper.toResponse(review, user_name, user_avatar);
      }),
    );

    return reviewsWithUser;
  }

  @Get('vendor/reviews/stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de reseñas del vendor' })
  async getStats(@Request() req) {
    const vendor = await this.vendorRepository.findByUserId(req.user.user_id);
    if (!vendor) throw new NotFoundException('Vendedor no encontrado');

    const stats = await this.getVendorReviewStatsUseCase.execute(vendor.vendor_id!);

    const total = stats.total_reviews;
    const recommended = (stats.rating_distribution[4] || 0) + (stats.rating_distribution[5] || 0);
    const recommended_percentage = total > 0 ? Math.round((recommended / total) * 100) : 0;

    return {
      ...stats,
      recommended_percentage,
    };
  }
}