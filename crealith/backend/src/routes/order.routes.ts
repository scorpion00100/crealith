import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireAuth, requireSeller } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes du panier
router.post('/cart/add', orderController.addToCart);
router.get('/cart', orderController.getCart);
router.put('/cart/:id', orderController.updateCartItem);
router.delete('/cart/:id', orderController.removeFromCart);
router.delete('/cart', orderController.clearCart);

// Routes des commandes
router.post('/orders', orderController.createOrder);
router.post('/orders/:id/confirm', orderController.confirmOrder);
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.delete('/orders/:id', orderController.cancelOrder);

// Routes pour les vendeurs
router.get('/seller/orders', requireSeller, orderController.getSellerOrders);

export default router;
