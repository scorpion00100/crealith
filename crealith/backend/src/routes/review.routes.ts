import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { requireAuth, requireOwnership } from '../middleware/auth.middleware';
import { validate, createReviewSchema, updateReviewSchema, idParamSchema, productIdParamSchema } from '../utils/validation';

const router = Router();

// Routes publiques
router.get('/product/:productId', validate(productIdParamSchema, 'params'), reviewController.getProductReviews);
router.get('/product/:productId/stats', validate(productIdParamSchema, 'params'), reviewController.getProductRatingStats);

// Routes protégées
router.use(requireAuth);

router.post('/', validate(createReviewSchema), reviewController.createReview);
router.put('/:id', validate(idParamSchema, 'params'), requireOwnership('review'), validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', validate(idParamSchema, 'params'), requireOwnership('review'), reviewController.deleteReview);
router.get('/user', reviewController.getUserReviews);
router.get('/product/:productId/has-reviewed', validate(productIdParamSchema, 'params'), reviewController.hasUserReviewed);
router.get('/product/:productId/has-purchased', validate(productIdParamSchema, 'params'), reviewController.hasUserPurchased);

export default router;
