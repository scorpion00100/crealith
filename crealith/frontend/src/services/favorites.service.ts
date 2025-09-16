import { apiService } from '@/services/api.ts';
import { Product } from '@/types';

class FavoritesServiceClass {
  async getFavorites(): Promise<Product[]> {
    // Backend returns { success, data } or array; apiService normalizes to data
    return apiService.get<Product[]>('/favorites');
  }

  async add(productId: string): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>('/favorites', { productId });
  }

  async remove(productId: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(`/favorites/${productId}`);
  }
}

export const favoritesService = new FavoritesServiceClass();


