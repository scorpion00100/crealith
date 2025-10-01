import { apiService } from '@/services/api.ts';
import { Product } from '@/types';

class FavoritesServiceClass {
  async getFavorites(): Promise<Product[]> {
    const resp = await apiService.get<any>('/favorites');
    // Support multiple backend shapes: {success,data:[...]}, {data:[...]}, [...]
    const raw = resp?.data?.data ?? resp?.data ?? resp;
    const items = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw?.items) ? raw.items : []);
    // Normalize id
    return items.map((p: any) => ({ ...p, id: p.id || p._id }));
  }

  async add(productId: string): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>('/favorites', { productId });
  }

  async remove(productId: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(`/favorites/${productId}`);
  }
}

export const favoritesService = new FavoritesServiceClass();


