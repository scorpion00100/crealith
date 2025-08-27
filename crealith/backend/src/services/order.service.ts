import { prisma } from '../app';
import { createError } from '../utils/errors';
import { stripe } from '../utils/stripe';
import { Order, OrderItem, CartItem, Product, Prisma } from '@prisma/client';

export interface CreateOrderData {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: string;
}

export interface CartItemData {
  userId: string;
  productId: string;
  quantity: number;
}

export class OrderService {
  async addToCart(data: CartItemData): Promise<CartItem> {
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: data.userId,
          productId: data.productId,
        },
      },
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + data.quantity },
        include: {
          product: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
    }

    return prisma.cartItem.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        quantity: data.quantity,
      },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async getCart(userId: string): Promise<CartItem[]> {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async updateCartItem(id: string, userId: string, quantity: number): Promise<CartItem> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw createError.notFound('Cart item not found');
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      throw createError.badRequest('Quantity must be greater than 0');
    }

    return prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async removeFromCart(id: string, userId: string): Promise<void> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw createError.notFound('Cart item not found');
    }

    await prisma.cartItem.delete({ where: { id } });
  }

  async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { userId } });
  }

  async createOrder(data: CreateOrderData): Promise<{ order: Order; paymentIntent: any }> {
    // Récupérer les items du panier
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: data.userId },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      throw createError.badRequest('Cart is empty');
    }

    // Calculer le total
    let totalAmount = 0;
    const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const cartItem of cartItems) {
      const price = parseFloat(cartItem.product.price.toString());
      const itemTotal = price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price,
      });
    }

    // Générer le numéro de commande
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: new Prisma.Decimal(totalAmount),
        userId: data.userId,
        paymentMethod: data.paymentMethod,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: new Prisma.Decimal(item.price),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    stripeAccountId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Créer le PaymentIntent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe utilise les centimes
      currency: 'eur',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    // Mettre à jour la commande avec l'ID de paiement
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id },
    });

    return { order, paymentIntent };
  }

  async confirmOrder(orderId: string, paymentIntentId: string): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw createError.notFound('Order not found');
    }

    if (order.stripePaymentId !== paymentIntentId) {
      throw createError.badRequest('Invalid payment intent');
    }

    // Vérifier le statut du paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw createError.badRequest('Payment not completed');
    }

    // Mettre à jour le statut de la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Incrémenter les téléchargements pour chaque produit
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          downloadsCount: {
            increment: item.quantity,
          },
        },
      });
    }

    // Vider le panier
    await this.clearCart(order.userId);

    return updatedOrder;
  }

  async getOrders(userId: string, role: string): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = role === 'ADMIN' ? {} : { userId };

    return prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string, userId: string, role: string): Promise<Order | null> {
    const where: Prisma.OrderWhereInput = {
      id,
      ...(role !== 'ADMIN' && { userId }),
    };

    return prisma.order.findUnique({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              userId: sellerId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          where: {
            product: {
              userId: sellerId,
            },
          },
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw createError.notFound('Order not found');
    }

    if (order.userId !== userId) {
      throw createError.forbidden('You can only cancel your own orders');
    }

    if (order.status !== 'PENDING') {
      throw createError.badRequest('Order cannot be cancelled');
    }

    return prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
