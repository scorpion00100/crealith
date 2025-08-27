import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'downloads' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: any[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export class SearchService {
  async searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      rating,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = filters;

    const skip = (page - 1) * limit;

    // Construire les conditions de recherche
    const where: any = {
      isActive: true
    };

    // Recherche par texte
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } }
      ];
    }

    // Filtre par catégorie
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Filtre par prix
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Filtre par tags
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }

    // Construire l'ordre de tri
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Récupérer les produits
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Calculer les moyennes de rating
    const productsWithRating = products.map(product => {
      const totalReviews = product.reviews.length;
      const averageRating = totalReviews > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      return {
        ...product,
        averageRating,
        totalReviews,
        reviews: undefined // Retirer les reviews du produit
      };
    });

    // Filtrer par rating si spécifié
    let filteredProducts = productsWithRating;
    if (rating !== undefined) {
      filteredProducts = productsWithRating.filter(product => product.averageRating >= rating);
    }

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      products: filteredProducts,
      total,
      page,
      totalPages,
      hasMore
    };
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ],
        isActive: true
      },
      select: {
        title: true,
        tags: true
      },
      take: 10
    });

    const results = new Set<string>();

    suggestions.forEach(product => {
      // Ajouter le titre si il contient la requête
      if (product.title.toLowerCase().includes(query.toLowerCase())) {
        results.add(product.title);
      }

      // Ajouter les tags qui contiennent la requête
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          results.add(tag);
        }
      });
    });

    return Array.from(results).slice(0, 10);
  }

  async getPopularSearches(): Promise<string[]> {
    // Pour l'exemple, retourner des recherches populaires statiques
    // En production, vous pourriez stocker et analyser les recherches réelles
    return [
      'dashboard',
      'template',
      'ui kit',
      'illustration',
      'icon pack',
      'mockup',
      'presentation',
      'logo',
      'website',
      'mobile app'
    ];
  }

  async getRelatedProducts(productId: string): Promise<any[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        tags: true,
        price: true
      }
    });

    if (!product) {
      return [];
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        OR: [
          { categoryId: product.categoryId },
          { tags: { hasSome: product.tags } },
          {
            price: {
              gte: product.price * 0.7,
              lte: product.price * 1.3
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        category: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 6
    });

    return relatedProducts.map(product => {
      const totalReviews = product.reviews.length;
      const averageRating = totalReviews > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      return {
        ...product,
        averageRating,
        totalReviews,
        reviews: undefined
      };
    });
  }
}
