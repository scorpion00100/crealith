import { ProductService } from '../../services/product.service';
import { PrismaClient } from '@prisma/client';
import { createError } from '../../utils/errors';

// Mock Prisma
const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  review: {
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
} as any;

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock les utilitaires
jest.mock('../../utils/errors', () => ({
  createError: {
    notFound: jest.fn((message) => new Error(message)),
    badRequest: jest.fn((message) => new Error(message)),
    forbidden: jest.fn((message) => new Error(message)),
    internal: jest.fn((message) => new Error(message)),
  },
}));

jest.mock('../../utils/imagekit', () => ({
  uploadToImageKit: jest.fn(),
  deleteFromImageKit: jest.fn(),
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    jest.clearAllMocks();
    productService = new ProductService();
  });

  describe('getProducts', () => {
    it('should return products with pagination', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Test Product',
          price: 29.99,
          isActive: true,
          user: { firstName: 'John', lastName: 'Doe' },
          category: { name: 'Templates' },
          _count: { reviews: 5 },
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await productService.getProducts({
        page: 1,
        limit: 10,
        categoryId: 'cat1',
        search: 'test',
      });

      expect(result).toEqual({
        products: mockProducts,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          category: { slug: 'templates' },
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { tags: { has: 'test' } },
          ],
        },
        include: {
          user: { select: { firstName: true, lastName: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should handle empty results', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const result = await productService.getProducts({ page: 1, limit: 10 });

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: '1',
        title: 'Test Product',
        price: 29.99,
        user: { firstName: 'John', lastName: 'Doe' },
        category: { name: 'Templates' },
        reviews: [],
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await productService.getProductById('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
          category: { select: { name: true, slug: true } },
          reviews: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });

    it('should throw error if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(productService.getProductById('nonexistent')).rejects.toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const productData = {
        title: 'New Product',
        description: 'Product description',
        price: 29.99,
        categoryId: 'cat1',
        userId: 'user1',
        fileUrl: 'https://example.com/file.zip',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        fileType: 'application/zip',
        fileSize: 1024000,
        // file: new File(['test'], 'test.zip', { type: 'application/zip' }),
        tags: ['test', 'product'],
      };

      const mockProduct = { id: '1', ...productData };
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await productService.createProduct(productData);

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: productData,
        include: {
          user: { select: { firstName: true, lastName: true } },
          category: { select: { name: true, slug: true } },
        },
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        description: 'Product description',
        price: -10,
        categoryId: 'cat1',
        userId: 'user1',
      };

      await expect(productService.createProduct(invalidData as any)).rejects.toThrow();
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const updateData = {
        title: 'Updated Product',
        price: 39.99,
      };

      const mockProduct = { id: '1', ...updateData };
      mockPrisma.product.update.mockResolvedValue(mockProduct);

      const result = await productService.updateProduct('1', updateData, 'user1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
        data: updateData,
        include: {
          user: { select: { firstName: true, lastName: true } },
          category: { select: { name: true, slug: true } },
        },
      });
    });

    it('should throw error if product not found or not owned by user', async () => {
      mockPrisma.product.update.mockRejectedValue(new Error('Record not found'));

      await expect(productService.updateProduct('1', { title: 'New Title' }, 'user1')).rejects.toThrow();
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockPrisma.product.delete.mockResolvedValue({ id: '1' });

      await productService.deleteProduct('1', 'user1');

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
      });
    });

    it('should throw error if product not found or not owned by user', async () => {
      mockPrisma.product.delete.mockRejectedValue(new Error('Record not found'));

      await expect(productService.deleteProduct('1', 'user1')).rejects.toThrow();
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Featured Product',
          isFeatured: true,
          user: { firstName: 'John', lastName: 'Doe' },
          category: { name: 'Templates' },
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      // const result = await productService.getFeaturedProducts(5);

      // expect(result).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isFeatured: true },
        include: {
          user: { select: { firstName: true, lastName: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    });
  });

  describe('getProductsByUser', () => {
    it('should return products by user', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'User Product',
          userId: 'user1',
          user: { firstName: 'John', lastName: 'Doe' },
          category: { name: 'Templates' },
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await productService.getProductsByUser('user1');

      expect(result).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });
});
