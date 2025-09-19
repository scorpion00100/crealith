import { apiService } from './api';

export interface ReviewUser {
  id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface ReviewItem {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: ReviewUser;
}

export interface ProductReviewsResponse {
  reviews: ReviewItem[];
  total: number;
  page: number;
  totalPages: number;
  averageRating: number;
}

class ReviewService {
  async getProductReviews(productId: string, page: number = 1, limit: number = 5): Promise<ProductReviewsResponse> {
    const res = await apiService.get<{ success: boolean; data: ProductReviewsResponse }>(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
    return res.data;
  }

  async getProductRatingStats(productId: string): Promise<{ averageRating: number; totalReviews: number }>{
    const res = await apiService.get<{ success: boolean; data: { averageRating: number; totalReviews: number } }>(`/reviews/product/${productId}/stats`);
    return res.data;
  }
}

export const reviewService = new ReviewService();
