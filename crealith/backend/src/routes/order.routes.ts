import express from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Routes protégées par authentification
router.use(authMiddleware);

// Récupérer les commandes de l'utilisateur
router.get('/', orderController.getUserOrders);

// Récupérer une commande spécifique
router.get('/:orderId', orderController.getOrderById);

// Créer une nouvelle commande
router.post('/', orderController.createOrder);

// Mettre à jour le statut d'une commande
router.patch('/:orderId/status', orderController.updateOrderStatus);

// Annuler une commande
router.delete('/:orderId', orderController.cancelOrder);

export default router;
