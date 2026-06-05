export interface Review {
  review_id: string;
  vendor_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string;
  created_at: Date;
  time_ago: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommended_percentage: number;
}