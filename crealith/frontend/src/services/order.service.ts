import { apiService } from './api';
import { CartItem, Order } from '@/types';

export class OrderServiceClass {
  async getCart(): Promise<CartItem[]> {
    const response = await apiService.get<{ success: boolean; data: CartItem[] }>('/cart');
    return response.data;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    const response = await apiService.post<{ success: boolean; data: CartItem }>('/cart', {
      productId,
      quantity
    });
    return response.data;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const response = await apiService.put<{ success: boolean; data: CartItem }>(`/cart/${id}`, {
      quantity
    });
    return response.data;
  }

  async removeFromCart(id: string): Promise<void> {
    await apiService.delete(`/cart/${id}`);
  }

  async clearCart(): Promise<void> {
    await apiService.delete('/cart');
  }

  async createOrder(orderData: any): Promise<Order> {
    const response = await apiService.post<{ success: boolean; data: Order }>('/orders', orderData);
    return response.data;
  }

  async getOrders(): Promise<Order[]> {
    const response = await apiService.get<{ success: boolean; data: Order[] }>('/orders');
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await apiService.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data;
  }
}

export const orderService = new OrderServiceClass();