import type { Review } from "../../domain/types/review.types";
import "./ReviewCard.css";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star-filled" : "star-empty"}>
          {i <= rating ? "★" : "☆"}
        </span>,
      );
    }
    return stars;
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-avatar">
          {review.user_avatar ? (
            <img src={review.user_avatar} alt={review.user_name} />
          ) : (
            <div className="avatar-placeholder">
              {review.user_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="review-user-info">
          <h4 className="review-user-name">{review.user_name}</h4>
          <div className="review-rating">{renderStars(review.rating)}</div>
        </div>
        <span className="review-time">{review.time_ago}</span>
      </div>
      <p className="review-comment">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;