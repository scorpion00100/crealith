import { Server as SocketIOServer } from 'socket.io';
import prisma from '../prisma';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  userId: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  createdAt: Date;
}

export class NotificationService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        read: data.read,
        actionUrl: data.action?.url,
        actionLabel: data.action?.label,
      }
    });

    // Envoyer la notification en temps réel
    this.io.to(`user_${data.userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      action: data.action,
      createdAt: notification.createdAt
    });

    return {
      id: notification.id,
      type: notification.type as 'success' | 'error' | 'warning' | 'info',
      title: notification.title,
      message: notification.message,
      userId: notification.userId,
      read: notification.read,
      action: data.action,
      createdAt: notification.createdAt
    };
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return notifications.map(notification => ({
      id: notification.id,
      type: notification.type as 'success' | 'error' | 'warning' | 'info',
      title: notification.title,
      message: notification.message,
      userId: notification.userId,
      read: notification.read,
      action: notification.actionUrl ? {
        label: notification.actionLabel || 'Voir',
        url: notification.actionUrl
      } : undefined,
      createdAt: notification.createdAt
    }));
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId
      },
      data: { read: true }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true }
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: userId
      }
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  }

  // Méthodes utilitaires pour créer des notifications spécifiques
  async notifyNewSale(sellerId: string, productTitle: string, amount: number): Promise<void> {
    await this.createNotification({
      type: 'success',
      title: 'Nouvelle vente !',
      message: `Votre produit "${productTitle}" vient d'être vendu pour ${amount}€.`,
      userId: sellerId,
      read: false,
      action: {
        label: 'Voir les détails',
        url: '/dashboard/sales'
      }
    });
  }

  async notifyNewReview(productId: string, sellerId: string, reviewerName: string): Promise<void> {
    await this.createNotification({
      type: 'info',
      title: 'Nouveau commentaire',
      message: `${reviewerName} a laissé un avis sur votre produit.`,
      userId: sellerId,
      read: false,
      action: {
        label: 'Voir l\'avis',
        url: `/dashboard/reviews`
      }
    });
  }

  async notifyOrderStatusChange(userId: string, orderNumber: string, status: string): Promise<void> {
    await this.createNotification({
      type: 'info',
      title: 'Statut de commande mis à jour',
      message: `Votre commande #${orderNumber} est maintenant ${status}.`,
      userId,
      read: false,
      action: {
        label: 'Voir la commande',
        url: `/dashboard/orders`
      }
    });
  }

  async notifyPaymentSuccess(userId: string, orderNumber: string): Promise<void> {
    await this.createNotification({
      type: 'success',
      title: 'Paiement réussi !',
      message: `Votre commande #${orderNumber} a été payée avec succès.`,
      userId,
      read: false,
      action: {
        label: 'Télécharger les fichiers',
        url: `/dashboard/orders`
      }
    });
  }
}
