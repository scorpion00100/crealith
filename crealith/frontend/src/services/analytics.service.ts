import { apiService } from './api';

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  salesByMonth: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    title: string;
    sales: number;
    revenue: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  usersByRole: {
    buyers: number;
    sellers: number;
    admins: number;
  };
  usersByMonth: Array<{
    month: string;
    newUsers: number;
  }>;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  totalDownloads: number;
  averageRating: number;
  productsByCategory: Array<{
    category: string;
    count: number;
  }>;
  topRatedProducts: Array<{
    productId: string;
    title: string;
    rating: number;
    reviews: number;
  }>;
}

export interface AdminAnalytics {
  users: UserAnalytics;
  products: ProductAnalytics;
  global: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
}

export class AnalyticsServiceClass {
  async getSellerAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<SalesAnalytics> {
    const response = await apiService.get<{ success: boolean; data: SalesAnalytics }>(`/analytics/seller?period=${period}`);
    return response.data;
  }

  async getAdminAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<AdminAnalytics> {
    const response = await apiService.get<{ success: boolean; data: AdminAnalytics }>(`/analytics/admin?period=${period}`);
    return response.data;
  }

  // Recently viewed endpoints (authenticated)
  async addRecentlyViewed(productId: string): Promise<void> {
    await apiService.post('/analytics/recently-viewed', { productId });
  }

  async getRecentlyViewed(limit = 12): Promise<Array<{ id: string }>> {
    const response = await apiService.get<{ success: boolean; data: Array<{ id: string }> }>(`/analytics/recently-viewed?limit=${limit}`);
    return response.data;
  }
}

export const analyticsService = new AnalyticsServiceClass();
