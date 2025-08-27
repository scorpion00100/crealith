import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { createError } from '../utils/errors';

const orderService = new OrderService();

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      throw createError.badRequest('Product ID is required');
    }

    const cartItem = await orderService.addToCart({
      userId: req.user!.id,
      productId,
      quantity: parseInt(quantity),
    });

    res.json({ success: true, data: cartItem });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartItems = await orderService.getCart(req.user!.id);
    res.json({ success: true, data: cartItems });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      throw createError.badRequest('Valid quantity is required');
    }

    const cartItem = await orderService.updateCartItem(
      req.params.id,
      req.user!.id,
      parseInt(quantity)
    );

    res.json({ success: true, data: cartItem });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderService.removeFromCart(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderService.clearCart(req.user!.id);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentMethod = 'card' } = req.body;

    const result = await orderService.createOrder({
      userId: req.user!.id,
      items: [], // Les items viennent du panier
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      data: {
        order: result.order,
        clientSecret: result.paymentIntent.client_secret,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      throw createError.badRequest('Payment intent ID is required');
    }

    const order = await orderService.confirmOrder(req.params.id, paymentIntentId);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getOrders(req.user!.id, req.user!.role);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id, req.user!.role);
    if (!order) {
      throw createError.notFound('Order not found');
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getSellerOrders(req.user!.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user!.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
