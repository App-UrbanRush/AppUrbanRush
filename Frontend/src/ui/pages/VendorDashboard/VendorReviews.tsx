import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import ReviewSummary from "../../components/vendor/ReviewSummary";
import ReviewCard from "../../components/vendor/ReviewCard";
import type { Review, ReviewStats } from "../../domain/types/review.types";
import "./VendorReviews.css";

const VendorReviews = () => {
  const { getVendorReviews, getVendorReviewStats } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        getVendorReviews(),
        getVendorReviewStats(),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
    } finally {
      setLoading(false);
    }
  }, [getVendorReviews, getVendorReviewStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <VendorLayout>
        <div className="vendor-reviews-loading">
          <h2>Cargando reseñas...</h2>
        </div>
      </VendorLayout>
    );
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <VendorLayout>
        <div className="vendor-reviews">
          <h1>Reseñas</h1>
          <div className="vendor-reviews-empty">
            <h3>No hay reseñas aún</h3>
            <p>Las reseñas de los clientes aparecerán aquí</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="vendor-reviews">
        <h1>Reseñas</h1>
        <ReviewSummary stats={stats} />
        <div className="vendor-reviews-list">
          {reviews.map((review) => (
            <ReviewCard key={review.review_id} review={review} />
          ))}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorReviews;