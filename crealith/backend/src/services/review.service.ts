import { prisma } from '../app';
import { createError } from '../utils/errors';
import { Review, Prisma } from '@prisma/client';

export interface CreateReviewData {
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export class ReviewService {
  async createReview(data: CreateReviewData): Promise<Review> {
    // Vérifier si l'utilisateur a acheté le produit
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: data.userId,
        status: 'PAID',
        items: {
          some: {
            productId: data.productId,
          },
        },
      },
    });

    if (!hasPurchased) {
      throw createError.forbidden('You can only review products you have purchased');
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: data.userId,
          productId: data.productId,
        },
      },
    });

    if (existingReview) {
      throw createError.conflict('You have already reviewed this product');
    }

    // Valider la note
    if (data.rating < 1 || data.rating > 5) {
      throw createError.badRequest('Rating must be between 1 and 5');
    }

    return prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateReview(reviewId: string, userId: string, data: UpdateReviewData): Promise<Review> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw createError.notFound('Review not found');
    }

    if (review.userId !== userId) {
      throw createError.forbidden('You can only update your own reviews');
    }

    const updateData: Prisma.ReviewUpdateInput = {};

    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw createError.badRequest('Rating must be between 1 and 5');
      }
      updateData.rating = data.rating;
    }

    if (data.comment !== undefined) {
      updateData.comment = data.comment;
    }

    return prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw createError.notFound('Review not found');
    }

    if (review.userId !== userId) {
      throw createError.forbidden('You can only delete your own reviews');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
  }> {
    const skip = (page - 1) * limit;

    const [reviews, total, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: averageRating._avg.rating || 0,
    };
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductRatingStats(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const [averageRating, totalReviews, ratingDistribution] = await Promise.all([
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { rating: true },
      }),
    ]);

    const distribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }

    ratingDistribution.forEach((item) => {
      distribution[item.rating] = item._count.rating;
    });

    return {
      averageRating: averageRating._avg.rating || 0,
      totalReviews,
      ratingDistribution: distribution,
    };
  }

  async hasUserReviewed(userId: string, productId: string): Promise<boolean> {
    const review = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!review;
  }

  async hasUserPurchased(userId: string, productId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: 'PAID',
        items: {
          some: {
            productId,
          },
        },
      },
    });

    return !!order;
  }
}
