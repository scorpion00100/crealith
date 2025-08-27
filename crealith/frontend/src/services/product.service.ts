import { apiService } from './api';
import { Product, ProductFilters } from '@/types';

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductResponse {
  product: Product;
}

class ProductServiceClass {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const response = await apiService.get<{ success: boolean; data: ProductsResponse }>('/products', filters);
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiService.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data;
  }

  async createProduct(formData: FormData): Promise<Product> {
    const response = await apiService.upload<{ success: boolean; data: Product }>('/products', formData);
    return response.data;
  }

  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const response = await apiService.upload<{ success: boolean; data: Product }>(`/products/${id}`, formData);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiService.delete<{ success: boolean; message: string }>(`/products/${id}`);
  }

  async getUserProducts(): Promise<Product[]> {
    const response = await apiService.get<{ success: boolean; data: Product[] }>('/products/user/products');
    return response.data;
  }

  async downloadProduct(id: string): Promise<{ downloadUrl: string }> {
    const response = await apiService.post<{ success: boolean; data: { downloadUrl: string } }>(`/products/${id}/download`);
    return response.data;
  }
}

export const productService = new ProductServiceClass();
