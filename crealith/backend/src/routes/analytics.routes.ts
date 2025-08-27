import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const analyticsController = new AnalyticsController();

// Routes pour les vendeurs
router.get('/seller', authenticateToken, requireRole(['SELLER', 'ADMIN']), analyticsController.getSellerAnalytics);

// Routes pour les admins
router.get('/admin', authenticateToken, requireRole(['ADMIN']), analyticsController.getAdminAnalytics);

export default router;
