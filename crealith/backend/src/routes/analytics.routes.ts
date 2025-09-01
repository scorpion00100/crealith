import express from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Routes protégées par authentification
router.use(authMiddleware);

// Analytics vendeur
router.get('/seller', analyticsController.getSellerAnalytics);

// Analytics acheteur
router.get('/buyer', analyticsController.getBuyerAnalytics);

// Analytics globales (admin)
router.get('/global', analyticsController.getGlobalAnalytics);

export default router;
