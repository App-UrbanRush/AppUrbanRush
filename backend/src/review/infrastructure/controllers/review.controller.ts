import { Controller, Get, UseGuards, Request, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetVendorReviewsUseCase } from '../../application/use-cases/get-vendor-reviews.use-case';
import { GetVendorReviewStatsUseCase } from '../../application/use-cases/get-vendor-review-stats.use-case';
import { ReviewMapper } from '../mappers/review.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';

@ApiTags('Reviews')
@Controller('vendor/reviews')
export class ReviewController {
  constructor(
    private readonly getVendorReviewsUseCase: GetVendorReviewsUseCase,
    private readonly getVendorReviewStatsUseCase: GetVendorReviewStatsUseCase,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepository: Repository<PeopleEntity>,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las reseñas del vendor' })
  async getReviews(@Request() req) {
    const vendorId = req.user.user_id;
    const reviews = await this.getVendorReviewsUseCase.execute(vendorId);

    // Obtener información de los usuarios (people) para cada review
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        const people = await this.peopleRepository.findOne({
          where: { user_id: review.user_id },
        });
        const user_name = people
          ? `${people.firstName} ${people.firstLastName}`
          : 'Usuario';
        // Por ahora no hay avatar_url en PeopleEntity, usamos null
        const user_avatar = null;

        return ReviewMapper.toResponse(review, user_name, user_avatar);
      }),
    );

    return reviewsWithUser;
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de reseñas del vendor' })
  async getStats(@Request() req) {
    const vendorId = req.user.user_id;
    const stats = await this.getVendorReviewStatsUseCase.execute(vendorId);

    // Calcular porcentaje de recomendadas (rating >= 4)
    const total = stats.total_reviews;
    const recommended = stats.rating_distribution[4] + stats.rating_distribution[5];
    const recommended_percentage = total > 0 ? Math.round((recommended / total) * 100) : 0;

    return {
      ...stats,
      recommended_percentage,
    };
  }
}