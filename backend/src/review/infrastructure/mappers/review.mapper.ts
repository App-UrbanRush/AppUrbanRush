import { ReviewModel } from '../../domain/entities/review.model';
import { ReviewResponse } from '../../application/dtos/review-response.dto';

export class ReviewMapper {
  static toResponse(
    review: ReviewModel,
    user_name: string,
    user_avatar: string | null,
  ): ReviewResponse {
    return {
      review_id: review.review_id!,
      vendor_id: review.vendor_id,
      user_id: review.user_id,
      user_name,
      user_avatar,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at!,
      time_ago: ReviewMapper.calculateTimeAgo(review.created_at!),
    };
  }

  private static calculateTimeAgo(date: Date): string {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Hace un momento';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
  }
}