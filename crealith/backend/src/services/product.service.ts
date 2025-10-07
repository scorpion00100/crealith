import prisma from '../prisma';
import { createError } from '../utils/errors';
import { Product, Prisma } from '@prisma/client';
import { redisService } from './redis.service';
import ImageKit from 'imagekit';
import { SecureLogger } from '../utils/secure-logger';

// Configuration ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/crealith',
});

/**
 * Upload un fichier vers ImageKit CDN
 * Fallback vers placeholder si ImageKit n'est pas configuré
 */
const uploadToImageKit = async (file: Express.Multer.File, folder: string) => {
  // Vérifier si ImageKit est configuré
  const isConfigured = process.env.IMAGEKIT_PUBLIC_KEY && 
                       process.env.IMAGEKIT_PRIVATE_KEY && 
                       process.env.IMAGEKIT_URL_ENDPOINT;

  if (!isConfigured) {
    SecureLogger.warn('ImageKit not configured, using placeholder', { folder });
    return {
      url: `https://via.placeholder.com/400x300?text=${folder}`,
      fileId: 'placeholder-id',
      fileName: file.originalname,
      filePath: `/${folder}/${file.originalname}`,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }

  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}_${file.originalname}`,
      folder: `/crealith/${folder}`,
      tags: ['crealith', folder, 'product'],
      useUniqueFileName: true,
    });

    SecureLogger.info('File uploaded to ImageKit', {
      fileId: result.fileId,
      folder,
      size: file.size,
    });

    return {
      url: result.url,
      fileId: result.fileId,
      fileName: result.name,
      filePath: result.filePath,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  } catch (error) {
    SecureLogger.error('ImageKit upload failed, using fallback', error, { folder });
    // Fallback vers placeholder en cas d'erreur
    return {
      url: `https://via.placeholder.com/400x300?text=${folder}`,
      fileId: 'error-fallback',
      fileName: file.originalname,
      filePath: `/${folder}/${file.originalname}`,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }
};

/**
 * Supprimer un fichier d'ImageKit
 */
const deleteFromImageKit = async (fileId: string): Promise<void> => {
  const isConfigured = process.env.IMAGEKIT_PUBLIC_KEY && 
                       process.env.IMAGEKIT_PRIVATE_KEY;

  if (!isConfigured || fileId === 'placeholder-id' || fileId === 'error-fallback' || fileId === 'temp-id') {
    return; // Pas besoin de supprimer les placeholders
  }

  try {
    await imagekit.deleteFile(fileId);
    SecureLogger.info('File deleted from ImageKit', { fileId });
  } catch (error) {
    SecureLogger.error('ImageKit delete failed (non-blocking)', error, { fileId });
    // Ne pas bloquer si la suppression échoue
  }
};

export interface CreateProductData {
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  file?: Express.Multer.File;
  thumbnail?: Express.Multer.File;
  tags: string[];
  categoryId: string;
  userId: string;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  originalPrice?: number;
  file?: Express.Multer.File;
  thumbnail?: Express.Multer.File;
  tags?: string[];
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export class ProductService {
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      // Upload du fichier principal si fourni
      let fileUrl = 'https://via.placeholder.com/400x300?text=No+File';
      let fileSize = 0;
      let fileType = 'application/octet-stream';
      
      if (data.file) {
        const fileUpload = await uploadToImageKit(data.file, 'products');
        fileUrl = fileUpload.url;
        fileSize = data.file.size;
        fileType = data.file.mimetype;
      }
      
      // Upload de la thumbnail si fournie
      let thumbnailUrl = fileUrl;
      if (data.thumbnail) {
        const thumbnailUpload = await uploadToImageKit(data.thumbnail, 'thumbnails');
        thumbnailUrl = thumbnailUpload.url;
      }

      const product = await prisma.product.create({
        data: {
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription,
          price: new Prisma.Decimal(data.price),
          originalPrice: data.originalPrice ? new Prisma.Decimal(data.originalPrice) : null,
          fileUrl: fileUrl,
          thumbnailUrl: thumbnailUrl,
          fileSize: fileSize,
          fileType: fileType,
          tags: data.tags,
          userId: data.userId,
          categoryId: data.categoryId,
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
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Invalider le cache des produits
      await redisService.cacheDelPattern('products:*');

      return product;
    } catch (error) {
      throw createError.internal('Failed to create product');
    }
  }

  async getProducts(filters: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'price' | 'createdAt' | 'downloadsCount';
    sortOrder?: 'asc' | 'desc';
    userId?: string;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    // Générer une clé de cache unique basée sur les filtres
    // Cache seulement pour les produits featured (page d'accueil) pour optimiser
    const cacheKey = filters.isFeatured && !filters.search && page === 1
      ? `products:featured:${JSON.stringify({ categoryId: filters.categoryId, limit })}`
      : null;

    // Vérifier le cache si applicable
    if (cacheKey) {
      const cached = await redisService.cacheGet<{ products: Product[]; total: number; page: number; totalPages: number }>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const where: Prisma.ProductWhereInput = {
      deletedAt: null, // ✅ Exclure les produits supprimés
      isActive: filters.isActive !== undefined ? filters.isActive : true,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.isFeatured && { isFeatured: true }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { tags: { hasSome: [filters.search] } },
        ],
      }),
      ...(filters.minPrice && { price: { gte: new Prisma.Decimal(filters.minPrice) } }),
      ...(filters.maxPrice && { price: { lte: new Prisma.Decimal(filters.maxPrice) } }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = (filters.sortOrder || 'desc') as any;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const result = {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Mettre en cache si applicable (TTL 5 minutes pour les produits featured)
    if (cacheKey) {
      await redisService.cacheSet(cacheKey, result, 5 * 60);
    }

    return result;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Retourner null si le produit est supprimé ou inactif
    if (product && (product.deletedAt || !product.isActive)) {
      return null;
    }

    return product;
  }

  async updateProduct(id: string, userId: string, data: UpdateProductData): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw createError.notFound('Product not found');
    }

    if (product.userId !== userId) {
      throw createError.forbidden('You can only update your own products');
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.price) updateData.price = new Prisma.Decimal(data.price);
    if (data.originalPrice !== undefined) {
      updateData.originalPrice = data.originalPrice ? new Prisma.Decimal(data.originalPrice) : null;
    }
    if (data.tags) updateData.tags = data.tags;
    if (data.categoryId) updateData.category = { connect: { id: data.categoryId } };
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    // Upload de nouveaux fichiers si fournis
    if (data.file) {
      const fileUpload = await uploadToImageKit(data.file, 'products');
      updateData.fileUrl = fileUpload.url;
      updateData.fileSize = data.file.size;
      updateData.fileType = data.file.mimetype;
    }

    if (data.thumbnail) {
      const thumbnailUpload = await uploadToImageKit(data.thumbnail, 'thumbnails');
      updateData.thumbnailUrl = thumbnailUpload.url;
    }

    const updated = await prisma.product.update({
      where: { id },
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Invalider le cache des produits
    await redisService.cacheDelPattern('products:*');

    return updated;
  }

  /**
   * Soft delete d'un produit (marque comme supprimé sans le supprimer de la DB)
   */
  async deleteProduct(id: string, userId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw createError.notFound('Product not found');
    }

    if (product.userId !== userId) {
      throw createError.forbidden('You can only delete your own products');
    }

    // Soft delete : marquer comme supprimé au lieu de supprimer
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
        isActive: false, // Désactiver aussi pour double sécurité
      },
    });

    // Invalider le cache des produits
    await redisService.cacheDelPattern('products:*');
    await redisService.cacheDel(`product:${id}`);
  }

  /**
   * Restaurer un produit soft-deleted
   */
  async restoreProduct(id: string, userId: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw createError.notFound('Product not found');
    }

    if (product.userId !== userId) {
      throw createError.forbidden('You can only restore your own products');
    }

    if (!product.deletedAt) {
      throw createError.badRequest('Product is not deleted');
    }

    const restored = await prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
        isActive: true,
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Invalider le cache
    await redisService.cacheDelPattern('products:*');

    return restored;
  }

  /**
   * Hard delete permanent (admin seulement)
   */
  async hardDeleteProduct(id: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw createError.notFound('Product not found');
    }

    // Suppression définitive de la base de données
    await prisma.product.delete({
      where: { id },
    });

    // Invalider le cache
    await redisService.cacheDelPattern('products:*');
    await redisService.cacheDel(`product:${id}`);
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { 
        userId, 
        isActive: true,
        deletedAt: null // ✅ Exclure les produits supprimés
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementDownloads(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        downloadsCount: {
          increment: 1,
        },
      },
    });
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
