import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

const orderService = new OrderService();

export const orderController = {
  /** Récupérer les commandes de l'utilisateur (role-aware). */
  async getUserOrders(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const role = req.user?.role as string;

      const orders = await orderService.getOrders(userId, role);

      res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Erreur récupération commandes:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du chargement des commandes' });
    }
  },

  /** Récupérer une commande spécifique (placeholder/mock). */
  async getOrderById(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId;

      // TODO: Remplacer par une vraie requête Prisma
      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-2024-001',
        totalAmount: 29.99,
        status: 'DELIVERED',
        createdAt: '2024-06-15T10:30:00Z',
        updatedAt: '2024-06-15T14:45:00Z',
        items: [
          {
            id: 'item-1',
            quantity: 1,
            price: 29.99,
            product: {
              id: 'prod-1',
              title: 'Template WordPress Premium',
              thumbnailUrl: 'https://via.placeholder.com/300x200?text=Template+WP',
              fileUrl: 'https://example.com/files/template-wp.zip',
              downloadsCount: 120
            }
          }
        ]
      };

      res.json(mockOrder);
    } catch (error) {
      console.error('Erreur récupération commande:', error);
      res.status(500).json({ message: 'Erreur lors du chargement de la commande' });
    }
  },

  /** Créer une commande ou confirmer un paiement existant (Stripe). */
  async createOrder(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const { paymentMethod, orderId, paymentIntentId } = req.body as { 
        paymentMethod: string; 
        orderId?: string; 
        paymentIntentId?: string; 
      };

      // Si orderId et paymentIntentId sont fournis, c'est une confirmation de paiement
      if (orderId && paymentIntentId) {
        const order = await orderService.confirmOrder(orderId, paymentIntentId);
        return res.json({ success: true, data: order });
      }

      // Sinon, créer une nouvelle commande
      const { order, paymentIntent } = await orderService.createOrder({ userId, items: [], paymentMethod });

      res.status(201).json({ success: true, data: { order, clientSecret: paymentIntent.client_secret } });
    } catch (error) {
      console.error('Erreur création commande:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande' });
    }
  },

  /** Confirmer une commande après paiement Stripe. */
  async confirmOrder(req: Request, res: Response) {
    try {
      const { orderId, paymentIntentId } = req.body as { orderId: string; paymentIntentId: string };
      const order = await orderService.confirmOrder(orderId, paymentIntentId);
      res.json({ success: true, data: order });
    } catch (error) {
      console.error('Erreur confirmation commande:', error);
      res.status(400).json({ success: false, message: 'Erreur lors de la confirmation de la commande' });
    }
  },

  /** Mettre à jour le statut d'une commande (placeholder/mock). */
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      // TODO: Implémenter la logique de mise à jour
      const mockOrder = {
        id: orderId,
        status: status,
        updatedAt: new Date().toISOString()
      };

      res.json(mockOrder);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
  },

  /** Annuler une commande avec remboursement Stripe si payée. */
  async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId as string;
      const { reason } = req.body;

      const order = await orderService.cancelOrder(id, userId, reason);
      
      res.json({ 
        success: true, 
        data: order,
        message: order.status === 'REFUNDED' 
          ? 'Order cancelled and refunded successfully' 
          : 'Order cancelled successfully'
      });
    } catch (error) {
      console.error('Erreur annulation commande:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'annulation de la commande' 
      });
    }
  },

  /** Télécharger la facture d'une commande. */
  async downloadInvoice(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId as string;

      const invoice = await orderService.getInvoice(orderId, userId);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice retrieved successfully'
      });
    } catch (error: any) {
      console.error('Erreur téléchargement facture:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erreur lors du téléchargement de la facture'
      });
    }
  }
};
