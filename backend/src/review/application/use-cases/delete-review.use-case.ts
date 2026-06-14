import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IReviewRepository } from '../../domain/repositories/review.repository.interface';

@Injectable()
export class DeleteReviewUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(userId: number, reviewId: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('No puedes eliminar una reseña que no te pertenece');
    }

    await this.reviewRepository.delete(reviewId);
    return { message: 'Reseña eliminada correctamente' };
  }
}
