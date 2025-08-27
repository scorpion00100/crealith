import { apiService } from './api';
import { CartItem, Order } from '@/types';

export interface CartResponse {
  cartItems: CartItem[];
}

export interface OrderResponse {
  order: Order;
  clientSecret?: string;
}

export interface OrdersResponse {
  orders: Order[];
}

class OrderServiceClass {
  // Panier
  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    const response = await apiService.post<{ success: boolean; data: CartItem }>('/orders/cart/add', {
      productId,
      quantity,
    });
    return response.data;
  }

  async getCart(): Promise<CartItem[]> {
    const response = await apiService.get<{ success: boolean; data: CartItem[] }>('/orders/cart');
    return response.data;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const response = await apiService.put<{ success: boolean; data: CartItem }>(`/orders/cart/${id}`, {
      quantity,
    });
    return response.data;
  }

  async removeFromCart(id: string): Promise<void> {
    await apiService.delete<{ success: boolean; message: string }>(`/orders/cart/${id}`);
  }

  async clearCart(): Promise<void> {
    await apiService.delete<{ success: boolean; message: string }>('/orders/cart');
  }

  // Commandes
  async createOrder(paymentMethod: string = 'card'): Promise<OrderResponse> {
    const response = await apiService.post<{ success: boolean; data: OrderResponse }>('/orders/orders', {
      paymentMethod,
    });
    return response.data;
  }

  async confirmOrder(orderId: string, paymentIntentId: string): Promise<Order> {
    const response = await apiService.post<{ success: boolean; data: Order }>(`/orders/orders/${orderId}/confirm`, {
      paymentIntentId,
    });
    return response.data;
  }

  async getOrders(): Promise<Order[]> {
    const response = await apiService.get<{ success: boolean; data: Order[] }>('/orders/orders');
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await apiService.get<{ success: boolean; data: Order }>(`/orders/orders/${id}`);
    return response.data;
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await apiService.delete<{ success: boolean; data: Order }>(`/orders/orders/${id}`);
    return response.data;
  }

  // Commandes vendeur
  async getSellerOrders(): Promise<Order[]> {
    const response = await apiService.get<{ success: boolean; data: Order[] }>('/orders/seller/orders');
    return response.data;
  }
}

export const orderService = new OrderServiceClass();
