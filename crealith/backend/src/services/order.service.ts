import prisma from '../prisma';
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
    // Utiliser le service cart pour vider le panier Redis
    const cartService = new (await import('./cart.service')).CartService();
    await cartService.clear(userId);
  }

  async createOrder(data: CreateOrderData): Promise<{ order: Order; paymentIntent: any }> {
    // Récupérer les items du panier depuis Redis (comme le service cart)
    const cartService = new (await import('./cart.service')).CartService();
    const cartItems = await cartService.getCart(data.userId);

    if (cartItems.length === 0) {
      throw createError.badRequest('Cart is empty');
    }

    // Calculer le total
    let totalAmount = 0;
    const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const cartItem of cartItems) {
      const price = parseFloat(cartItem.product.price);
      const itemTotal = price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: cartItem.product.id,
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

  /**
   * Annuler une commande avec remboursement Stripe si payée
   */
  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
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

    // Vérifier la propriété
    if (order.userId !== userId) {
      throw createError.forbidden('You can only cancel your own orders');
    }

    // Vérifier si la commande peut être annulée
    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      throw createError.badRequest('Order is already cancelled or refunded');
    }

    // Si la commande est payée, effectuer un remboursement Stripe
    if (order.status === 'PAID' && order.stripePaymentId) {
      try {
        // Créer un remboursement Stripe
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentId,
          reason: 'requested_by_customer',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: userId,
            cancelReason: reason || 'Customer request',
          },
        });

        // Créer une transaction de remboursement
        await prisma.transaction.create({
          data: {
            stripePaymentId: refund.id,
            amount: order.totalAmount,
            currency: 'eur',
            status: 'COMPLETED',
            type: 'REFUND',
            description: `Refund for order ${order.orderNumber}`,
            userId: userId,
            orderId: orderId,
            metadata: {
              refundId: refund.id,
              reason: reason || 'Customer request',
              refundedAt: new Date().toISOString(),
            },
          },
        });

        // Mettre à jour le statut de la commande
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'REFUNDED',
            cancelReason: reason,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        return updatedOrder;
      } catch (error: any) {
        throw createError.badRequest(`Refund failed: ${error.message}`);
      }
    }

    // Si la commande n'est pas encore payée, simplement l'annuler
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  async getOrders(userId: string, role: string): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = role === 'ADMIN' ? { deletedAt: null } : { userId, deletedAt: null };

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
    const where: Prisma.OrderWhereUniqueInput = {
      id,
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
