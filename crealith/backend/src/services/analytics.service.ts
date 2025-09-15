import prisma from '../prisma';

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  salesByMonth: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    title: string;
    sales: number;
    revenue: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  usersByRole: {
    buyers: number;
    sellers: number;
    admins: number;
  };
  usersByMonth: Array<{
    month: string;
    newUsers: number;
  }>;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  totalDownloads: number;
  averageRating: number;
  productsByCategory: Array<{
    category: string;
    count: number;
  }>;
  topRatedProducts: Array<{
    productId: string;
    title: string;
    rating: number;
    reviews: number;
  }>;
}

export class AnalyticsService {
  async getSellerAnalytics(sellerId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<SalesAnalytics> {
    const startDate = this.getStartDate(period);
    
    // Total des ventes et revenus
    const salesData = await prisma.order.aggregate({
      where: {
        items: {
          some: {
            product: {
              userId: sellerId
            }
          }
        },
        status: 'PAID',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    // Ventes par mois
    const salesByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', o.created_at) as month,
        COUNT(*) as sales,
        SUM(o.total_amount) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.user_id = ${sellerId}
        AND o.status = 'PAID'
        AND o.created_at >= ${startDate}
      GROUP BY DATE_TRUNC('month', o.created_at)
      ORDER BY month DESC
    `;

    // Produits les plus vendus
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        product: {
          userId: sellerId
        },
        order: {
          status: 'PAID',
          createdAt: {
            gte: startDate
          }
        }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { title: true }
        });
        
        return {
          productId: item.productId,
          title: product?.title || 'Unknown',
          sales: item._sum.quantity || 0,
          revenue: Number(item._sum.price) || 0
        };
      })
    );

    const totalRevenue = Number(salesData._sum.totalAmount) || 0;
    const totalOrders = salesData._count || 0;

    return {
      totalSales: totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalOrders,
      salesByMonth: salesByMonth as any,
      topProducts: topProductsWithDetails
    };
  }

  async getAdminAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    const startDate = this.getStartDate(period);

    // Analytics utilisateurs
    const userAnalytics = await this.getUserAnalytics(startDate);

    // Analytics produits
    const productAnalytics = await this.getProductAnalytics(startDate);

    // Analytics globales
    const globalAnalytics = await this.getGlobalAnalytics(startDate);

    return {
      users: userAnalytics,
      products: productAnalytics,
      global: globalAnalytics
    };
  }

  private async getUserAnalytics(startDate: Date): Promise<UserAnalytics> {
    const totalUsers = await prisma.user.count();
    
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    const usersByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;

    return {
      totalUsers,
      newUsersThisMonth,
      activeUsers: totalUsers, // Simplifié pour l'exemple
      usersByRole: {
        buyers: usersByRole.find(u => u.role === 'BUYER')?._count || 0,
        sellers: usersByRole.find(u => u.role === 'SELLER')?._count || 0,
        admins: usersByRole.find(u => u.role === 'ADMIN')?._count || 0
      },
      usersByMonth: usersByMonth as any
    };
  }

  private async getProductAnalytics(startDate: Date): Promise<ProductAnalytics> {
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    });

    const totalDownloads = await prisma.product.aggregate({
      _sum: {
        downloadsCount: true
      }
    });

    const averageRating = await prisma.review.aggregate({
      _avg: {
        rating: true
      }
    });

    const productsByCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: true
    });

    const topRatedProducts = await prisma.product.findMany({
      where: {
        reviews: {
          some: {}
        }
      },
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        reviews: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return {
      totalProducts,
      activeProducts,
      totalDownloads: totalDownloads._sum.downloadsCount || 0,
      averageRating: averageRating._avg.rating || 0,
      productsByCategory: await Promise.all(
        productsByCategory.map(async (cat) => {
          const category = await prisma.category.findUnique({
            where: { id: cat.categoryId }
          });
          return {
            category: category?.name || 'Unknown',
            count: cat._count
          };
        })
      ),
      topRatedProducts: topRatedProducts.map(product => ({
        productId: product.id,
        title: product.title,
        rating: product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length,
        reviews: product.reviews.length
      }))
    };
  }

  private async getGlobalAnalytics(startDate: Date) {
    const totalRevenue = await prisma.order.aggregate({
      where: {
        status: 'PAID',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        totalAmount: true
      }
    });

    const totalOrders = await prisma.order.count({
      where: {
        status: 'PAID',
        createdAt: {
          gte: startDate
        }
      }
    });

    return {
      totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? Number(totalRevenue._sum.totalAmount) / totalOrders : 0
    };
  }

  private getStartDate(period: 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}
