import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FavoriteService {
  async getUserFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId
      },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            category: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculer les moyennes de rating pour chaque produit
    const favoritesWithRating = favorites.map(favorite => {
      const product = favorite.product;
      const totalReviews = product.reviews.length;
      const averageRating = totalReviews > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      return {
        ...favorite,
        product: {
          ...product,
          averageRating,
          totalReviews,
          reviews: undefined // Retirer les reviews du produit
        }
      };
    });

    return favoritesWithRating.map(favorite => favorite.product);
  }

  async addToFavorites(userId: string, productId: string) {
    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Vérifier si le favori existe déjà
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    if (existingFavorite) {
      throw new Error('Product is already in favorites');
    }

    // Ajouter aux favoris
    const favorite = await prisma.favorite.create({
      data: {
        userId: userId,
        productId: productId
      },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            category: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    });

    // Calculer la moyenne de rating
    const productWithRating = favorite.product;
    const totalReviews = productWithRating.reviews.length;
    const averageRating = totalReviews > 0 
      ? productWithRating.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    return {
      ...productWithRating,
      averageRating,
      totalReviews,
      reviews: undefined
    };
  }

  async removeFromFavorites(userId: string, productId: string) {
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    });
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    return !!favorite;
  }
}
