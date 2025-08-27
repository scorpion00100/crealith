import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/notifications - Récupérer les notifications de l'utilisateur
router.get('/', notificationController.getUserNotifications);

// GET /api/notifications/unread-count - Récupérer le nombre de notifications non lues
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/mark-all-read - Marquer toutes les notifications comme lues
router.put('/mark-all-read', notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
