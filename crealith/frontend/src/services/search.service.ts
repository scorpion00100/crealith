import { apiService } from './api';
import { Product } from '@/types';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'downloads' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export class SearchServiceClass {
  async searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await apiService.get<{ success: boolean; data: SearchResult }>(`/search?${params.toString()}`);
    return response.data;
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const response = await apiService.get<{ success: boolean; data: string[] }>(`/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getPopularSearches(): Promise<string[]> {
    const response = await apiService.get<{ success: boolean; data: string[] }>('/search/popular');
    return response.data;
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    const response = await apiService.get<{ success: boolean; data: Product[] }>(`/search/related/${productId}`);
    return response.data;
  }
}

export const searchService = new SearchServiceClass();
