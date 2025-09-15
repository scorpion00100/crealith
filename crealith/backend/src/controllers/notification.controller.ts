import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    // Note: Le service sera injecté via le middleware Socket.io
    this.notificationService = new NotificationService(null as any);
  }

  getUserNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const notifications = await this.notificationService.getUserNotifications(userId);
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const count = await this.notificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await this.notificationService.markAsRead(id, userId);
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  markAllAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;

      await this.notificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  deleteNotification = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await this.notificationService.deleteNotification(id, userId);
      
      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}
