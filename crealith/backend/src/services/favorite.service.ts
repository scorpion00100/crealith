import prisma from '../prisma';

export class FavoriteService {
  async getUserFavorites(userId: string) {
    try {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId
        },
        include: {
          product: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Retourner les produits favoris avec des données simplifiées
      return favorites.map(favorite => ({
        id: favorite.product.id,
        title: favorite.product.title,
        price: favorite.product.price,
        description: favorite.product.description,
        thumbnailUrl: favorite.product.thumbnailUrl,
        averageRating: 0,
        totalReviews: 0
      }));
    } catch (error: any) {
      console.error('Error in getUserFavorites:', error);
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
  }

  async addToFavorites(userId: string, productId: string) {
    try {
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
        // Retourner le produit existant au lieu de lever une erreur
        return {
          id: product.id,
          title: product.title,
          price: product.price,
          description: product.description,
          thumbnailUrl: product.thumbnailUrl,
          averageRating: 0,
          totalReviews: 0
        };
      }

      // Ajouter aux favoris
      await prisma.favorite.create({
        data: {
          userId: userId,
          productId: productId
        }
      });

      // Retourner les infos du produit sans les relations complexes
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        thumbnailUrl: product.thumbnailUrl,
        averageRating: 0,
        totalReviews: 0
      };
    } catch (error: any) {
      console.error('Error in addToFavorites:', error);
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }
  }

  async removeFromFavorites(userId: string, productId: string) {
    try {
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId: userId,
          productId: productId
        }
      });

      if (!favorite) {
        // Ne pas lever d'erreur si le favori n'existe pas
        return;
      }

      await prisma.favorite.delete({
        where: {
          id: favorite.id
        }
      });
    } catch (error: any) {
      console.error('Error in removeFromFavorites:', error);
      throw new Error(`Failed to remove from favorites: ${error.message}`);
    }
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    try {
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId: userId,
          productId: productId
        }
      });

      return !!favorite;
    } catch (error: any) {
      console.error('Error in isFavorite:', error);
      return false;
    }
  }
}
