import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { createError } from '../utils/errors';

const reviewService = new ReviewService();

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      throw createError.badRequest('Product ID and rating are required');
    }

    const review = await reviewService.createReview({
      userId: req.user!.userId,
      productId,
      rating: parseInt(rating),
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rating, comment } = req.body;

    const updateData: any = {};
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (comment !== undefined) updateData.comment = comment;

    const review = await reviewService.updateReview(req.params.id, req.user!.userId, updateData);
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await reviewService.getProductReviews(req.params.productId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductRatingStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await reviewService.getProductRatingStats(req.params.productId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await reviewService.getUserReviews(req.user!.userId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const hasUserReviewed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hasReviewed = await reviewService.hasUserReviewed(req.user!.userId, req.params.productId);
    res.json({ success: true, data: { hasReviewed } });
  } catch (error) {
    next(error);
  }
};

export const hasUserPurchased = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hasPurchased = await reviewService.hasUserPurchased(req.user!.userId, req.params.productId);
    res.json({ success: true, data: { hasPurchased } });
  } catch (error) {
    next(error);
  }
};
