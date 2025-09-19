import { redisService } from './redis.service';
import prisma from '../prisma';

export interface CartItemDTO {
  id: string; // cart item id
  product: {
    id: string;
    title: string;
    price: string;
    description?: string | null;
    image?: string | null;
  };
  quantity: number;
  createdAt: string;
}

const buildCartKey = (userId: string) => `cart:${userId}`;

export class CartService {
  private async readCart(userId: string): Promise<CartItemDTO[]> {
    try {
      const key = buildCartKey(userId);
      const raw = await redisService.redis.get(key);
      if (!raw) return [];
      try { 
        return JSON.parse(raw); 
      } catch (parseError) {
        console.error('Error parsing cart data:', parseError);
        return []; 
      }
    } catch (error) {
      console.error('Error reading cart from Redis:', error);
      return [];
    }
  }

  private async writeCart(userId: string, items: CartItemDTO[]): Promise<void> {
    try {
      const key = buildCartKey(userId);
      await redisService.redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(items));
    } catch (error) {
      console.error('Error writing cart to Redis:', error);
      throw error;
    }
  }

  async getCart(userId: string): Promise<CartItemDTO[]> {
    return await this.readCart(userId);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItemDTO> {
    try {
      if (quantity <= 0) quantity = 1;
      const items = await this.readCart(userId);
      const idx = items.findIndex(i => i.product.id === productId);
      if (idx >= 0) {
        items[idx].quantity += quantity;
        await this.writeCart(userId, items);
        return items[idx];
      }

      // Fetch product minimal info
      const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true },
        select: { id: true, title: true, price: true, description: true, thumbnailUrl: true }
      });
      if (!product) throw Object.assign(new Error('Product not found or inactive'), { statusCode: 404 });

      const item: CartItemDTO = {
        id: `${productId}:${Date.now()}`,
        product: {
          id: product.id,
          title: product.title || 'Produit',
          price: String(product.price),
          description: product.description || null,
          image: product.thumbnailUrl || null,
        },
        quantity,
        createdAt: new Date().toISOString(),
      };
      items.push(item);
      await this.writeCart(userId, items);
      return item;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateItem(userId: string, id: string, quantity: number): Promise<CartItemDTO> {
    try {
      const items = await this.readCart(userId);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw Object.assign(new Error('Cart item not found'), { statusCode: 404 });
      if (quantity <= 0) {
        items.splice(idx, 1);
        await this.writeCart(userId, items);
        throw Object.assign(new Error('Item removed'), { statusCode: 204, removed: true });
      }
      items[idx].quantity = quantity;
      await this.writeCart(userId, items);
      return items[idx];
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeItem(userId: string, id: string): Promise<void> {
    try {
      const items = await this.readCart(userId);
      const next = items.filter(i => i.id !== id);
      await this.writeCart(userId, next);
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  async clear(userId: string): Promise<void> {
    try {
      await this.writeCart(userId, []);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export const cartService = new CartService();


