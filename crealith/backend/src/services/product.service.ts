import { prisma } from '../app';
import { createError } from '../utils/errors';
import { Product, Prisma } from '@prisma/client';

// TODO: Implémenter l'upload ImageKit
const uploadToImageKit = async (file: Express.Multer.File, folder: string) => {
  // Simulation temporaire
  return {
    url: `https://via.placeholder.com/400x300?text=${folder}`,
    fileId: 'temp-id',
    fileName: file.originalname,
    filePath: `/${folder}/${file.originalname}`,
    fileType: file.mimetype,
    fileSize: file.size,
  };
};

export interface CreateProductData {
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  file: Express.Multer.File;
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
      // Upload du fichier principal
      const fileUpload = await uploadToImageKit(data.file, 'products');
      
      // Upload de la thumbnail si fournie
      let thumbnailUrl = null;
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
          fileUrl: fileUpload.url,
          thumbnailUrl: thumbnailUrl || fileUpload.url,
          fileSize: data.file.size,
          fileType: data.file.mimetype,
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
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: filters.isActive !== undefined ? filters.isActive : true,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
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
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
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

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id, isActive: true },
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

    return prisma.product.update({
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
  }

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

    await prisma.product.delete({
      where: { id },
    });
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { userId, isActive: true },
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
