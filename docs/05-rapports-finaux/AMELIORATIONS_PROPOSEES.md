# 🚀 AMÉLIORATIONS PROPOSÉES - CREALITH

## 📋 Vue d'ensemble
Ce document détaille toutes les améliorations proposées suite à l'audit complet.
**À VALIDER avant application.**

---

## 🔴 SPRINT 1 - CRITIQUES (1-2 jours)

### ✅ 1. Sécuriser docker-compose.yml

#### ❌ AVANT (Actuel)
```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: password123  # ❌ En clair, faible
```

#### ✅ APRÈS (Proposé)
```yaml
services:
  postgres:
    env_file:
      - .env.docker
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      
  redis:
    env_file:
      - .env.docker
    command: redis-server --requirepass ${REDIS_PASSWORD}
```

**Fichier `.env.docker` à créer** :
```env
# Secrets Docker - NE PAS COMMITTER
POSTGRES_PASSWORD=VotreMotDePasseSecurise123!@#
REDIS_PASSWORD=VotreRedisPasswordSecurise456$%^
```

**Ajouter à `.gitignore`** :
```
.env.docker
```

---

### ✅ 2. Supprimer logique de test du code prod

#### ❌ PROBLÈME (auth.service.ts)
- Lignes 11, 27, 89-108, 225-239, 243-260
- Map testUsers en mémoire dans le code production
- Conditions if (NODE_ENV === 'test') partout

#### ✅ SOLUTION
Créer un service mock séparé uniquement pour les tests :

**Fichier : `backend/src/__tests__/mocks/auth.service.mock.ts`**
```typescript
import { AuthService } from '../../services/auth.service';
import { PrismaClient } from '@prisma/client';

export class AuthServiceMock extends AuthService {
  private static testUsers = new Map<string, any>();
  
  // Toute la logique de test ici
  static getTestUser(email: string) {
    return this.testUsers.get(email);
  }
  
  static setTestUser(email: string, user: any) {
    this.testUsers.set(email, user);
  }
  
  static clearTestUsers() {
    this.testUsers.clear();
  }
}
```

**Nettoyer auth.service.ts** : Supprimer toutes les références à `testUsers` et `NODE_ENV === 'test'`.

---

### ✅ 3. Implémenter annulation commande + remboursement Stripe

#### ❌ AVANT (order.controller.ts, ligne 123)
```typescript
// TODO: Implémenter la logique d'annulation avec remboursement Stripe
```

#### ✅ APRÈS (order.service.ts)
```typescript
async cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!order) {
    throw createError.notFound('Order not found');
  }

  if (order.userId !== userId) {
    throw createError.forbidden('Not authorized');
  }

  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    throw createError.badRequest('Order already cancelled');
  }

  // Remboursement Stripe si payé
  if (order.status === 'PAID' && order.stripePaymentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentId,
        reason: 'requested_by_customer',
        metadata: {
          orderId: order.id,
          userId: userId,
          cancelReason: reason || 'Customer request'
        }
      });

      // Créer une transaction de remboursement
      await prisma.transaction.create({
        data: {
          stripePaymentId: refund.id,
          amount: order.totalAmount,
          currency: 'eur',
          status: 'COMPLETED',
          type: 'REFUND',
          description: `Refund for order ${order.orderNumber}`,
          userId: userId,
          orderId: orderId,
          metadata: { reason }
        }
      });

      // Mettre à jour le statut
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'REFUNDED' },
        include: { items: { include: { product: true } } }
      });

      SecureLogger.info('Order refunded successfully', {
        orderId,
        userId,
        refundId: refund.id,
        amount: order.totalAmount
      });

      return updated;
    } catch (error) {
      SecureLogger.error('Stripe refund failed', error, { orderId, userId });
      throw createError.badRequest('Refund failed: ' + (error as Error).message);
    }
  }

  // Si non payé, simplement annuler
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
    include: { items: { include: { product: true } } }
  });

  return updated;
}
```

**Controller : order.controller.ts**
```typescript
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, user.userId, reason);
    res.json({ success: true, data: order, message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
```

**Route : order.routes.ts**
```typescript
router.post('/:id/cancel', authenticateToken, cancelOrder);
```

---

### ✅ 4. Implémenter upload ImageKit

#### ❌ AVANT (product.service.ts, ligne 6)
```typescript
// TODO: Implémenter l'upload ImageKit
```

#### ✅ APRÈS (product.service.ts)
```typescript
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

async uploadToImageKit(file: Express.Multer.File, folder: string): Promise<{ url: string; fileId: string }> {
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}_${file.originalname}`,
      folder: folder,
      tags: ['product', 'crealith'],
      useUniqueFileName: true
    });

    return {
      url: result.url,
      fileId: result.fileId
    };
  } catch (error) {
    SecureLogger.error('ImageKit upload failed', error);
    throw createError.badRequest('Failed to upload file');
  }
}

async deleteFromImageKit(fileId: string): Promise<void> {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    SecureLogger.error('ImageKit delete failed', error);
    // Ne pas bloquer si la suppression échoue
  }
}

// Dans createProduct et updateProduct :
async createProduct(data: CreateProductData): Promise<Product> {
  // ... validation

  let fileUrl = '';
  let thumbnailUrl = '';
  let fileMetadata: any = {};

  // Upload du fichier principal vers ImageKit
  if (data.file) {
    const uploadResult = await this.uploadToImageKit(data.file, '/products/files');
    fileUrl = uploadResult.url;
    fileMetadata.fileId = uploadResult.fileId;
  }

  // Upload de la vignette vers ImageKit
  if (data.thumbnail) {
    const uploadResult = await this.uploadToImageKit(data.thumbnail, '/products/thumbnails');
    thumbnailUrl = uploadResult.url;
    fileMetadata.thumbnailId = uploadResult.fileId;
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      fileUrl,
      thumbnailUrl,
      // Stocker les IDs ImageKit dans un champ JSON pour pouvoir supprimer plus tard
    }
  });

  return product;
}
```

**Schema Prisma : Ajouter champ metadata**
```prisma
model Product {
  // ... champs existants
  metadata Json? // Pour stocker fileId, thumbnailId ImageKit
}
```

---

### ✅ 5. Implémenter vraies requêtes Analytics

#### ❌ AVANT (analytics.controller.ts, lignes 7, 74, 96)
```typescript
// TODO: Remplacer par de vraies requêtes Prisma
const stats = {
  totalRevenue: 15000,
  totalSales: 120,
  // ... données mockées
};
```

#### ✅ APRÈS (analytics.service.ts - NOUVEAU FICHIER)
```typescript
import prisma from '../prisma';
import { createError } from '../utils/errors';

export class AnalyticsService {
  async getSellerStats(userId: string, startDate?: Date, endDate?: Date) {
    // Définir les dates par défaut (30 derniers jours)
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Total des revenus
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

    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.items.filter(item => item.product.userId === userId);
      return sum + sellerItems.reduce((itemSum, item) => 
        itemSum + Number(item.price) * item.quantity, 0);
    }, 0);

    const totalSales = orders.length;

    // Produits les plus vendus
    const topProducts = await prisma.product.findMany({
      where: { 
        userId,
        orderItems: {
          some: {
            order: {
              status: 'PAID',
              createdAt: { gte: start, lte: end }
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            orderItems: {
              where: {
                order: {
                  status: 'PAID',
                  createdAt: { gte: start, lte: end }
                }
              }
            }
          }
        }
      },
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Statistiques par produit
    const products = await prisma.product.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        price: true,
        downloadsCount: true,
        _count: {
          select: {
            orderItems: {
              where: {
                order: { status: 'PAID', createdAt: { gte: start, lte: end } }
              }
            }
          }
        }
      }
    });

    const productStats = products.map(p => ({
      productId: p.id,
      title: p.title,
      sales: p._count.orderItems,
      revenue: Number(p.price) * p._count.orderItems,
      downloads: p.downloadsCount
    }));

    // Revenus par jour (derniers 30 jours)
    const dailyRevenue = await this.getDailyRevenue(userId, start, end);

    return {
      totalRevenue,
      totalSales,
      totalProducts: products.length,
      totalDownloads: products.reduce((sum, p) => sum + p.downloadsCount, 0),
      topProducts: topProducts.map(p => ({
        id: p.id,
        title: p.title,
        sales: p._count.orderItems,
        revenue: Number(p.price) * p._count.orderItems
      })),
      productStats,
      dailyRevenue,
      period: { start, end }
    };
  }

  async getAdminStats(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Statistiques globales
    const [totalUsers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ 
        where: { status: 'PAID', createdAt: { gte: start, lte: end } }
      }),
      prisma.order.aggregate({
        where: { status: 'PAID', createdAt: { gte: start, lte: end } },
        _sum: { totalAmount: true }
      })
    ]);

    // Utilisateurs par rôle
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: true
    });

    // Produits par catégorie
    const productsByCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      where: { isActive: true },
      _count: true,
      orderBy: { _count: { categoryId: 'desc' } }
    });

    // Top vendeurs
    const topSellers = await prisma.user.findMany({
      where: {
        role: 'SELLER',
        products: {
          some: {
            orderItems: {
              some: {
                order: { status: 'PAID', createdAt: { gte: start, lte: end } }
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
        products: {
          include: {
            _count: {
              select: {
                orderItems: {
                  where: {
                    order: { status: 'PAID', createdAt: { gte: start, lte: end } }
                  }
                }
              }
            }
          }
        }
      },
      take: 10
    });

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      usersByRole,
      productsByCategory,
      topSellers: topSellers.map(seller => ({
        id: seller.id,
        name: `${seller.firstName} ${seller.lastName}`,
        email: seller.email,
        totalSales: seller.products.reduce(
          (sum, p) => sum + p._count.orderItems, 0
        )
      })),
      period: { start, end }
    };
  }

  async getBuyerStats(userId: string) {
    const [totalOrders, totalSpent, purchasedProducts] = await Promise.all([
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
        }
      })
    ]);

    const products = purchasedProducts.flatMap(order => 
      order.items.map(item => item.product)
    );

    const favoriteCategories = await prisma.favorite.groupBy({
      by: ['productId'],
      where: { userId },
      _count: true
    });

    return {
      totalOrders,
      totalSpent: Number(totalSpent._sum.totalAmount || 0),
      totalProducts: products.length,
      uniqueProducts: new Set(products.map(p => p.id)).size,
      favoriteCount: favoriteCategories.length,
      recentPurchases: products.slice(0, 5)
    };
  }

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

    return Array.from(dailyData.entries()).map(([date, revenue]) => ({
      date,
      revenue
    }));
  }
}
```

**Controller : analytics.controller.ts**
```typescript
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export const getSellerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { startDate, endDate } = req.query;
    
    const stats = await analyticsService.getSellerStats(
      user.userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await analyticsService.getAdminStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
```

---

### ✅ 6. Ajouter soft delete au schema Prisma

#### ❌ AVANT
```prisma
model Product {
  id String @id @default(cuid())
  // ... pas de deletedAt
}

model User {
  // ... pas de deletedAt
}
```

#### ✅ APRÈS
```prisma
model Product {
  id              String        @id @default(cuid())
  // ... champs existants
  deletedAt       DateTime?     @map("deleted_at")
  deletedBy       String?       @map("deleted_by") // userId qui a supprimé
  
  @@index([deletedAt])
  @@index([isActive, deletedAt])
}

model User {
  id            String    @id @default(cuid())
  // ... champs existants
  deletedAt     DateTime? @map("deleted_at")
  deletedBy     String?   @map("deleted_by")
  
  @@index([deletedAt])
}

model Order {
  // ... champs existants
  deletedAt     DateTime? @map("deleted_at")
  
  @@index([deletedAt])
}
```

**Migration** :
```bash
npx prisma migrate dev --name add_soft_delete
```

**Service : product.service.ts**
```typescript
async deleteProduct(id: string, userId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!product) {
    throw createError.notFound('Product not found');
  }

  if (product.userId !== userId) {
    throw createError.forbidden('Not authorized');
  }

  // Soft delete au lieu de hard delete
  await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
      isActive: false // Désactiver aussi
    }
  });

  // Supprimer du cache Redis
  await redisService.cacheDelPattern('products:*');
  await redisService.cacheDel(`product:${id}`);
}

// Ajouter méthode de restauration
async restoreProduct(id: string, userId: string): Promise<Product> {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    throw createError.notFound('Product not found');
  }

  if (product.userId !== userId && req.user.role !== 'ADMIN') {
    throw createError.forbidden('Not authorized');
  }

  const restored = await prisma.product.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedBy: null,
      isActive: true
    }
  });

  return restored;
}

// Modifier getProducts pour exclure les supprimés
async getProducts(filters: ProductFilters): Promise<{ products: Product[]; total: number }> {
  const where: Prisma.ProductWhereInput = {
    deletedAt: null, // ✅ Exclure les supprimés
    isActive: filters.isActive !== false,
    // ... autres filtres
  };
  // ... reste du code
}
```

---

### ✅ 7. Créer .env.example à la racine

**Fichier : `.env.example` (racine)**
```env
# ==============================================
# CREALITH - Configuration Globale
# ==============================================
# Copier ce fichier vers .env et remplir avec vos vraies valeurs

# ==============================================
# DOCKER
# ==============================================
POSTGRES_PASSWORD=VotreMotDePassePostgresSecurise
REDIS_PASSWORD=VotreMotDePasseRedisSecurise

# ==============================================
# BACKEND (voir crealith/backend/env.example)
# ==============================================
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:55432/crealith_dev

# ==============================================
# FRONTEND (voir crealith/frontend/env.example)
# ==============================================
VITE_API_URL=http://localhost:5000/api

# ==============================================
# PRODUCTION (voir env.prod.example)
# ==============================================
# NODE_ENV=production
# DATABASE_URL=postgresql://user:pass@prod-host:5432/crealith_prod
```

---

### ✅ 8. Réduire logs debug en production

#### ❌ AVANT (redis.service.ts - 11 occurrences)
```typescript
SecureLogger.debug(`Cache set: ${key}`, { ttl: ttlSeconds });
SecureLogger.debug(`Cache hit: ${key}`);
```

#### ✅ APRÈS
```typescript
// En haut du fichier
const IS_DEBUG = process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development';

// Dans les méthodes
async cacheSet(key: string, value: any, ttlSeconds?: number): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
    if (IS_DEBUG) {
      SecureLogger.debug(`Cache set: ${key}`, { ttl: ttlSeconds });
    }
  } catch (error) {
    SecureLogger.error(`Failed to set cache for key: ${key}`, error);
  }
}

async cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await this.redis.get(key);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    if (IS_DEBUG) {
      SecureLogger.debug(`Cache hit: ${key}`);
    }
    return parsed as T;
  } catch (error) {
    SecureLogger.error(`Failed to get cache for key: ${key}`, error);
    return null;
  }
}

// Appliquer le même pattern à tous les debug logs (11 occurrences)
```

---

## 📊 RÉCAPITULATIF DES FICHIERS À MODIFIER

### Nouveaux fichiers
- [x] `AMELIORATIONS_PROPOSEES.md` (ce fichier)
- [ ] `.env.docker` (avec secrets forts)
- [ ] `.env.example` (racine)
- [ ] `backend/src/__tests__/mocks/auth.service.mock.ts`
- [ ] `backend/src/services/analytics.service.ts`

### Fichiers à modifier
- [ ] `docker-compose.yml` - Externaliser secrets
- [ ] `.gitignore` - Ajouter .env.docker
- [ ] `crealith/backend/src/services/auth.service.ts` - Nettoyer testUsers
- [ ] `crealith/backend/src/services/order.service.ts` - Ajouter cancelOrder
- [ ] `crealith/backend/src/controllers/order.controller.ts` - Ajouter cancelOrder
- [ ] `crealith/backend/src/routes/order.routes.ts` - Route /cancel
- [ ] `crealith/backend/src/services/product.service.ts` - Implémenter ImageKit
- [ ] `crealith/backend/src/controllers/analytics.controller.ts` - Utiliser AnalyticsService
- [ ] `crealith/backend/prisma/schema.prisma` - Ajouter deletedAt
- [ ] `crealith/backend/src/services/redis.service.ts` - Conditionner debug logs

### Migrations
- [ ] `npx prisma migrate dev --name add_soft_delete`
- [ ] `npx prisma migrate dev --name add_product_metadata`

---

## ⚡ COMMANDES POUR APPLIQUER

```bash
# 1. Créer les fichiers de configuration
touch .env.docker
echo ".env.docker" >> .gitignore

# 2. Tests après modifications
cd crealith/backend
npm test

# 3. Migrations Prisma
npx prisma migrate dev --name add_soft_delete
npx prisma migrate dev --name add_product_metadata
npx prisma generate

# 4. Rebuild
npm run build

# 5. Redémarrer Docker
cd ../..
docker-compose down
docker-compose up -d
```

---

## ✅ CHECKLIST DE VALIDATION

Avant d'appliquer, vérifier :

- [ ] Tous les secrets sont dans des .env (pas en dur)
- [ ] .gitignore contient .env.docker
- [ ] Les tests passent (npm test)
- [ ] Les migrations Prisma sont créées
- [ ] Le code compile sans erreurs (npm run build)
- [ ] Les TODO critiques sont résolus
- [ ] Pas de logique de test dans le code prod
- [ ] Soft delete implémenté sur les modèles principaux

---

## 📝 NOTES

- **Backup database** avant migration de production !
- Tester d'abord sur environnement de dev/staging
- Les remboursements Stripe nécessitent une clé API valide
- ImageKit nécessite un compte configuré
- Les logs debug seront désactivés en production (LOG_LEVEL=info)

---

**Prêt pour validation ?** ✅
Une fois validé, je peux appliquer ces modifications fichier par fichier.

