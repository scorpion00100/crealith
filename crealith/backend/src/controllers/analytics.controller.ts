import { Request, Response } from 'express';

export const analyticsController = {
  // Analytics pour les vendeurs
  async getSellerAnalytics(req: Request, res: Response) {
    try {
      // TODO: Remplacer par de vraies requêtes Prisma
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
  async getBuyerAnalytics(req: Request, res: Response) {
    try {
      // TODO: Remplacer par de vraies requêtes Prisma
      const mockData = {
        totalOrders: 12,
        totalSpent: 456.78,
        averageOrderValue: 38.07,
        favoriteCategories: ['Templates', 'Graphiques', 'E-books'],
        recentPurchases: [
          { productId: '1', title: 'Template WordPress Premium', purchasedAt: '2024-06-15' },
          { productId: '2', title: 'Pack Icônes Vectorielles', purchasedAt: '2024-06-10' }
        ]
      };

      res.json(mockData);
    } catch (error) {
      console.error('Erreur analytics acheteur:', error);
      res.status(500).json({ message: 'Erreur lors du chargement des analytics' });
    }
  },

  // Analytics globales (admin)
  async getGlobalAnalytics(req: Request, res: Response) {
    try {
      // TODO: Remplacer par de vraies requêtes Prisma
      const mockData = {
        totalRevenue: 15420.50,
        totalSales: 423,
        totalUsers: 156,
        totalProducts: 89,
        topSellers: [
          { sellerId: '1', name: 'Design Studio Pro', revenue: 2847.23 },
          { sellerId: '2', name: 'Code Masters', revenue: 2156.78 },
          { sellerId: '3', name: 'Digital Assets Co', revenue: 1890.45 }
        ],
        popularCategories: [
          { name: 'Templates', sales: 156 },
          { name: 'Graphiques', sales: 98 },
          { name: 'E-books', sales: 67 }
        ]
      };

      res.json(mockData);
    } catch (error) {
      console.error('Erreur analytics globales:', error);
      res.status(500).json({ message: 'Erreur lors du chargement des analytics' });
    }
  }
};
