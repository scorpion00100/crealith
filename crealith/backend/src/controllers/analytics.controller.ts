import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getSellerAnalytics = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const period = (req.query.period as 'week' | 'month' | 'year') || 'month';

      const analytics = await this.analyticsService.getSellerAnalytics(userId, period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getAdminAnalytics = async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as 'week' | 'month' | 'year') || 'month';

      const analytics = await this.analyticsService.getAdminAnalytics(period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}
