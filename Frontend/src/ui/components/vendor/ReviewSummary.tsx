import type { ReviewStats } from "../../../domain/types/review.types";
import "./ReviewSummary.css";

interface ReviewSummaryProps {
  stats: ReviewStats;
}

const ReviewSummary = ({ stats }: ReviewSummaryProps) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(stats.average_rating) ? "star-filled" : "star-empty"}>
          {i <= Math.round(stats.average_rating) ? "★" : "☆"}
        </span>,
      );
    }
    return stars;
  };

  const totalBars = Object.values(stats.rating_distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="review-summary">
      <div className="review-summary-header">
        <div className="review-summary-main">
          <div className="review-average">
            <span className="average-stars">{renderStars()}</span>
            <span className="average-number">{stats.average_rating.toFixed(1)}</span>
            <span className="average-out-of">/5</span>
          </div>
          <div className="review-total">
            <span className="total-number">{stats.total_reviews}</span>
            <span className="total-label">reseñas</span>
          </div>
          <div className="review-recommended">
            <span className="recommended-percentage">{stats.recommended_percentage}%</span>
            <span className="recommended-label">recomendadas</span>
          </div>
        </div>
      </div>

      <div className="rating-bars">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
          const percentage = totalBars > 0 ? (count / totalBars) * 100 : 0;

          return (
            <div key={rating} className="rating-bar-row">
              <span className="rating-label">{rating} ★</span>
              <div className="rating-bar">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="rating-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSummary;