import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Routes publiques
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/stats', reviewController.getProductRatingStats);

// Routes protégées
router.use(requireAuth);

router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.get('/user', reviewController.getUserReviews);
router.get('/product/:productId/has-reviewed', reviewController.hasUserReviewed);
router.get('/product/:productId/has-purchased', reviewController.hasUserPurchased);

export default router;
