import { apiService } from './api';
import { Product, ProductFilters } from '@/types';

export interface ProductResponse {
  products: Product[];
  page: number;
  total: number;
  totalPages: number;
}

/**
 * Service de produits: encapsule les appels API et types de réponse.
 */
export class ProductServiceClass {
  /** Liste paginée/filtrée des produits. */
  async getProducts(filters?: ProductFilters): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiService.get<{ success: boolean; data: ProductResponse }>(`/products?${params.toString()}`);
    return response.data;
  }

  /** Détail d'un produit par id. */
  async getProductById(id: string): Promise<Product> {
    const response = await apiService.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data;
  }

  /** Création d'un produit. */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await apiService.post<{ success: boolean; data: Product }>('/products', productData);
    return response.data;
  }

  /** Mise à jour partielle d'un produit. */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await apiService.put<{ success: boolean; data: Product }>(`/products/${id}`, productData);
    return response.data;
  }

  /** Suppression d'un produit. */
  async deleteProduct(id: string): Promise<void> {
    await apiService.delete(`/products/${id}`);
  }

  /** Produits en vedette. */
  async getFeaturedProducts(): Promise<Product[]> {
    const response = await apiService.get<{ success: boolean; data: Product[] }>('/products/featured');
    return response.data;
  }

  /** Produits d'un utilisateur. */
  async getProductsByUser(userId: string): Promise<Product[]> {
    const response = await apiService.get<{ success: boolean; data: Product[] }>(`/products/user/${userId}`);
    return response.data;
  }
}

export const productService = new ProductServiceClass();