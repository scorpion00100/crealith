import prisma from '../prisma';
import { createError } from '../utils/errors';
import { SecureLogger } from '../utils/secure-logger';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Service d'analytics pour vendeurs, acheteurs et admins.
 * Remplace les données mockées par de vraies requêtes Prisma.
 */
export class AnalyticsService {
  /**
   * Statistiques vendeur avec vraies données Prisma
   */
  async getSellerStats(userId: string, startDate?: Date, endDate?: Date) {
    // Définir les dates par défaut (30 derniers jours)
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      // Récupérer toutes les commandes du vendeur
      const orders = await prisma.order.findMany({
        where: {
          items: {
            some: {
              product: { userId }
            }
          },
          status: 'PAID',
          createdAt: { gte: start, lte: end }
        },
        include: {
          items: {
            where: { product: { userId } },
            include: { product: true }
          }
        }
      });

      // Calculer le revenu total
      const totalRevenue = orders.reduce((sum, order) => {
        const sellerItems = order.items.filter(item => item.product.userId === userId);
        return sum + sellerItems.reduce((itemSum, item) => 
          itemSum + Number(item.price) * item.quantity, 0);
      }, 0);

      const totalSales = orders.length;

      // Produits les plus vendus
      const productSales = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          product: { userId },
          order: {
            status: 'PAID',
            createdAt: { gte: start, lte: end }
          }
        },
        _sum: {
          quantity: true
        },
        _count: {
          productId: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      });

      // Enrichir avec les détails des produits
      const topProducts = await Promise.all(
        productSales.map(async (ps) => {
          const product = await prisma.product.findUnique({
            where: { id: ps.productId },
            select: {
              id: true,
              title: true,
              price: true,
              thumbnailUrl: true
            }
          });

          return {
            id: product?.id || ps.productId,
            title: product?.title || 'Unknown',
            sales: ps._sum.quantity || 0,
            revenue: product ? Number(product.price) * (ps._sum.quantity || 0) : 0,
            thumbnailUrl: product?.thumbnailUrl
          };
        })
      );

      // Statistiques par produit (exclure les supprimés)
      const products = await prisma.product.findMany({
        where: { userId, deletedAt: null },
        select: {
          id: true,
          title: true,
          price: true,
          downloadsCount: true,
          createdAt: true
        }
      });

      const productStats = await Promise.all(
        products.map(async (p) => {
          const sales = await prisma.orderItem.aggregate({
            where: {
              productId: p.id,
              order: {
                status: 'PAID',
                createdAt: { gte: start, lte: end }
              }
            },
            _sum: {
              quantity: true
            }
          });

          const quantity = sales._sum.quantity || 0;
          return {
            productId: p.id,
            title: p.title,
            sales: quantity,
            revenue: Number(p.price) * quantity,
            downloads: p.downloadsCount
          };
        })
      );

      // Revenus par jour (derniers 30 jours)
      const dailyRevenue = await this.getDailyRevenue(userId, start, end);

      SecureLogger.info('Seller analytics generated', {
        userId: userId.substring(0, 8) + '...',
        period: { start, end },
        totalRevenue,
        totalSales
      });

      return {
        totalRevenue,
        totalSales,
        totalProducts: products.length,
        totalDownloads: products.reduce((sum, p) => sum + p.downloadsCount, 0),
        topProducts,
        productStats,
        dailyRevenue,
        period: { start, end }
      };
    } catch (error) {
      SecureLogger.error('Error generating seller analytics', error, { userId });
      throw createError.internal('Failed to generate seller analytics');
    }
  }

  /**
   * Statistiques admin avec vraies données Prisma
   */
  async getAdminStats(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      // Statistiques globales en parallèle
      const [totalUsers, totalProducts, totalOrders, revenueData] = await Promise.all([
        prisma.user.count({ where: { isActive: true, deletedAt: null } }),
        prisma.product.count({ where: { isActive: true, deletedAt: null } }),
        prisma.order.count({ 
          where: { status: 'PAID', createdAt: { gte: start, lte: end } }
        }),
        prisma.order.aggregate({
          where: { status: 'PAID', createdAt: { gte: start, lte: end } },
          _sum: { totalAmount: true }
        })
      ]);

      const totalRevenue = Number(revenueData._sum.totalAmount || 0);

      // Utilisateurs par rôle
      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        where: { isActive: true, deletedAt: null },
        _count: true
      });

      const roleStats = usersByRole.map(r => ({
        role: r.role,
        count: r._count
      }));

      // Produits par catégorie
      const productsByCategory = await prisma.product.groupBy({
        by: ['categoryId'],
        where: { isActive: true, deletedAt: null },
        _count: true,
        orderBy: { _count: { categoryId: 'desc' } },
        take: 10
      });

      // Enrichir avec les noms de catégories
      const categoryStats = await Promise.all(
        productsByCategory.map(async (pc) => {
          const category = await prisma.category.findUnique({
            where: { id: pc.categoryId },
            select: { name: true }
          });
          return {
            categoryId: pc.categoryId,
            categoryName: category?.name || 'Unknown',
            count: pc._count
          };
        })
      );

      // Top vendeurs
      const topSellers = await this.getTopSellers(start, end);

      // Revenus par jour
      const dailyRevenue = await this.getGlobalDailyRevenue(start, end);

      // Métriques de croissance
      const previousPeriod = new Date(start.getTime() - (end.getTime() - start.getTime()));
      const previousRevenue = await prisma.order.aggregate({
        where: { 
          status: 'PAID', 
          createdAt: { gte: previousPeriod, lt: start } 
        },
        _sum: { totalAmount: true }
      });

      const previousTotal = Number(previousRevenue._sum.totalAmount || 0);
      const revenueGrowth = previousTotal > 0 
        ? ((totalRevenue - previousTotal) / previousTotal) * 100 
        : 0;

      SecureLogger.info('Admin analytics generated', {
        period: { start, end },
        totalRevenue,
        totalOrders,
        revenueGrowth
      });

      return {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          revenueGrowth
        },
        usersByRole: roleStats,
        productsByCategory: categoryStats,
        topSellers,
        dailyRevenue,
        period: { start, end }
      };
    } catch (error) {
      SecureLogger.error('Error generating admin analytics', error);
      throw createError.internal('Failed to generate admin analytics');
    }
  }

  /**
   * Statistiques acheteur avec vraies données Prisma
   */
  async getBuyerStats(userId: string) {
    try {
      const [totalOrders, spentData, purchasedProducts, favoriteCount] = await Promise.all([
        prisma.order.count({
          where: { userId, status: 'PAID' }
        }),
        prisma.order.aggregate({
          where: { userId, status: 'PAID' },
          _sum: { totalAmount: true }
        }),
        prisma.order.findMany({
          where: { userId, status: 'PAID' },
          include: {
            items: {
              include: { product: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.favorite.count({
          where: { userId }
        })
      ]);

      const totalSpent = Number(spentData._sum.totalAmount || 0);

      // Extraire tous les produits uniques
      const allProducts = purchasedProducts.flatMap(order => 
        order.items.map(item => item.product)
      );
      const uniqueProductIds = new Set(allProducts.map(p => p.id));

      // Catégories favorites (basées sur les achats)
      const categoryPurchases = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            userId,
            status: 'PAID'
          }
        },
        _count: true
      });

      const categoryCounts = new Map<string, number>();
      for (const cp of categoryPurchases) {
        const product = await prisma.product.findUnique({
          where: { id: cp.productId },
          select: { categoryId: true }
        });
        if (product) {
          categoryCounts.set(
            product.categoryId, 
            (categoryCounts.get(product.categoryId) || 0) + cp._count
          );
        }
      }

      const topCategories = Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const enrichedCategories = await Promise.all(
        topCategories.map(async ([categoryId, count]) => {
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { name: true }
          });
          return {
            categoryId,
            categoryName: category?.name || 'Unknown',
            purchaseCount: count
          };
        })
      );

      // Achats récents
      const recentPurchases = purchasedProducts.slice(0, 5).map(order => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        amount: Number(order.totalAmount),
        itemCount: order.items.length,
        products: order.items.map(item => ({
          id: item.product.id,
          title: item.product.title,
          thumbnailUrl: item.product.thumbnailUrl
        }))
      }));

      return {
        totalOrders,
        totalSpent,
        totalProducts: allProducts.length,
        uniqueProducts: uniqueProductIds.size,
        favoriteCount,
        topCategories: enrichedCategories,
        recentPurchases
      };
    } catch (error) {
      SecureLogger.error('Error generating buyer analytics', error, { userId });
      throw createError.internal('Failed to generate buyer analytics');
    }
  }

  /**
   * Revenus journaliers pour un vendeur
   */
  private async getDailyRevenue(userId: string, start: Date, end: Date) {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { product: { userId } }
        },
        status: 'PAID',
        createdAt: { gte: start, lte: end }
      },
      include: {
        items: {
          where: { product: { userId } },
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const dailyData = new Map<string, number>();
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const revenue = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
      );
      dailyData.set(date, (dailyData.get(date) || 0) + revenue);
    });

    return Array.from(dailyData.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Revenus journaliers globaux (admin)
   */
  private async getGlobalDailyRevenue(start: Date, end: Date) {
    const orders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: start, lte: end }
      },
      select: {
        createdAt: true,
        totalAmount: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const dailyData = new Map<string, number>();
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyData.set(date, (dailyData.get(date) || 0) + Number(order.totalAmount));
    });

    return Array.from(dailyData.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Top vendeurs (admin)
   */
  private async getTopSellers(start: Date, end: Date) {
    const sellers = await prisma.user.findMany({
      where: {
        role: 'SELLER',
        isActive: true,
        deletedAt: null,
        products: {
          some: {
            orderItems: {
              some: {
                order: { 
                  status: 'PAID', 
                  createdAt: { gte: start, lte: end } 
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true
      }
    });

    const sellerStats = await Promise.all(
      sellers.map(async (seller) => {
        const orders = await prisma.order.findMany({
          where: {
            items: {
              some: {
                product: { userId: seller.id }
              }
            },
            status: 'PAID',
            createdAt: { gte: start, lte: end }
          },
          include: {
            items: {
              where: { product: { userId: seller.id } },
              include: { product: true }
            }
          }
        });

        const totalRevenue = orders.reduce((sum, order) => {
          return sum + order.items.reduce((itemSum, item) => 
            itemSum + Number(item.price) * item.quantity, 0
          );
        }, 0);

        const totalSales = orders.length;

        return {
          id: seller.id,
          name: `${seller.firstName} ${seller.lastName}`,
          email: seller.email,
          avatar: seller.avatar,
          totalSales,
          totalRevenue
        };
      })
    );

    return sellerStats
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }
}
