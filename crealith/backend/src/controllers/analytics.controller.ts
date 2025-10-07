import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export const analyticsController = {
  // Analytics pour les vendeurs
  async getSellerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const { startDate, endDate } = req.query;
      
      const stats = await analyticsService.getSellerStats(
        user.userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  // Analytics pour les acheteurs - Gardé avec mockData pour compatibilité
  async getBuyerAnalytics_LEGACY(req: Request, res: Response) {
    try {
      const mockData = {
        revenue: {
          total: 2847.23,
          monthly: 847.23,
          weekly: 234.56,
          daily: 45.67
        },
        sales: {
          total: 77,
          monthly: 23,
          weekly: 8,
          daily: 2
        },
        products: {
          total: 3,
          active: 2,
          draft: 1
        },
        customers: {
          total: 45,
          new: 12,
          returning: 33
        },
        ratings: {
          average: 4.6,
          total: 23
        },
        downloads: {
          total: 205,
          monthly: 67
        },
        charts: {
          revenueByMonth: [
            { month: 'Jan', revenue: 1200 },
            { month: 'Fév', revenue: 1400 },
            { month: 'Mar', revenue: 1600 },
            { month: 'Avr', revenue: 1800 },
            { month: 'Mai', revenue: 2000 },
            { month: 'Juin', revenue: 2847 }
          ],
          salesByMonth: [
            { month: 'Jan', sales: 15 },
            { month: 'Fév', sales: 18 },
            { month: 'Mar', sales: 22 },
            { month: 'Avr', sales: 25 },
            { month: 'Mai', sales: 28 },
            { month: 'Juin', sales: 77 }
          ],
          topProducts: [
            { name: 'Template WordPress Premium', sales: 45, revenue: 1349.55 },
            { name: 'Pack Icônes Vectorielles', sales: 32, revenue: 639.68 },
            { name: 'E-book Marketing Digital', sales: 0, revenue: 0 }
          ]
        }
      };

      res.json(mockData);
    } catch (error) {
      console.error('Erreur analytics vendeur:', error);
      res.status(500).json({ message: 'Erreur lors du chargement des analytics' });
    }
  },

  // Analytics pour les acheteurs
  async getBuyerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      
      const stats = await analyticsService.getBuyerStats(user.userId);
      
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  // Analytics globales (admin)
  async getGlobalAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await analyticsService.getAdminStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
};
