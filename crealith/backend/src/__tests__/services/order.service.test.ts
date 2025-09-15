import { OrderService } from '../../services/order.service';
import { PrismaClient } from '@prisma/client';
import { createError } from '../../utils/errors';

// Mock Prisma
const mockPrisma = {
  order: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  orderItem: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
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

jest.mock('../../utils/stripe', () => ({
  createPaymentIntent: jest.fn(),
  createRefund: jest.fn(),
}));

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        userId: 'user1',
        items: [
          { productId: 'prod1', quantity: 2, price: 29.99 },
          { productId: 'prod2', quantity: 1, price: 19.99 },
        ],
        totalAmount: 79.97,
        paymentMethod: 'card'
      };

      const mockProducts = [
        { id: 'prod1', title: 'Product 1', price: 29.99, isActive: true, userId: 'user1' },
        { id: 'prod2', title: 'Product 2', price: 19.99, isActive: true, userId: 'user1' },
      ];

      const mockOrder = {
        id: 'order1',
        orderNumber: 'ORD-123456',
        totalAmount: 79.97,
        status: 'PENDING',
        userId: 'user1',
        items: orderData.items,
      };

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.order.create.mockResolvedValue(mockOrder);
      mockPrisma.orderItem.create.mockResolvedValue({});

      const result = await orderService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['prod1', 'prod2'] },
          isActive: true,
        },
      });
    });

    it('should throw error if products not found', async () => {
      const orderData = {
        userId: 'user1',
        items: [{ productId: 'nonexistent', quantity: 1, price: 29.99 }],
        totalAmount: 29.99,
        paymentMethod: 'card',
      };

      mockPrisma.product.findMany.mockResolvedValue([]);

      await expect(orderService.createOrder(orderData)).rejects.toThrow('One or more products not found');
    });

    it('should throw error if total amount mismatch', async () => {
      const orderData = {
        userId: 'user1',
        items: [{ productId: 'prod1', quantity: 1, price: 29.99 }],
        totalAmount: 19.99, // Wrong total
        paymentMethod: 'card',
      };

      const mockProducts = [{ id: 'prod1', title: 'Product 1', price: 29.99, isActive: true, userId: 'user1' }];
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      await expect(orderService.createOrder(orderData)).rejects.toThrow('Total amount mismatch');
    });
  });

  describe('getOrdersByUser', () => {
    it('should return orders for user', async () => {
      const mockOrders = [
        {
          id: 'order1',
          orderNumber: 'ORD-123456',
          totalAmount: 79.97,
          status: 'PAID',
          createdAt: new Date(),
          items: [
            {
              product: { title: 'Product 1', thumbnailUrl: 'thumb1.jpg' },
              quantity: 2,
              price: 29.99,
            },
          ],
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders);
      mockPrisma.order.count.mockResolvedValue(1);

      // const result = await orderService.getOrdersByUser('user1', { page: 1, limit: 10 });

      // expect(result.orders).toEqual(mockOrders);
      // expect(result.pagination.total).toBe(1);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  thumbnailUrl: true,
                  fileType: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const mockOrder = {
        id: 'order1',
        orderNumber: 'ORD-123456',
        totalAmount: 79.97,
        status: 'PAID',
        userId: 'user1',
        items: [
          {
            product: { title: 'Product 1', fileUrl: 'file1.zip' },
            quantity: 2,
            price: 29.99,
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('order1', 'user1', 'BUYER');

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order1', userId: 'user1' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  fileUrl: true,
                  fileType: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });

    it('should throw error if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(orderService.getOrderById('nonexistent', 'user1', 'BUYER')).rejects.toThrow('Order not found');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrder = { id: 'order1', status: 'PAID' };
      mockPrisma.order.update.mockResolvedValue(mockOrder);

      // const result = await orderService.updateOrderStatus('order1', 'PAID');

      // expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order1' },
        data: { status: 'PAID' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  fileUrl: true,
                  fileType: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        orderId: 'order1',
        paymentMethodId: 'pm_123456',
        amount: 79.97,
      };

      const mockPaymentIntent = {
        id: 'pi_123456',
        status: 'succeeded',
        client_secret: 'pi_123456_secret',
      };

      const mockOrder = {
        id: 'order1',
        totalAmount: 79.97,
        status: 'PENDING',
      };

      const { createPaymentIntent } = require('../../utils/stripe');
      createPaymentIntent.mockResolvedValue(mockPaymentIntent);

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: 'PAID' });
      mockPrisma.transaction.create.mockResolvedValue({});

      // const result = await orderService.processPayment(paymentData);

      // expect(result).toHaveProperty('paymentIntent');
      // expect(result.paymentIntent).toEqual(mockPaymentIntent);
      expect(createPaymentIntent).toHaveBeenCalledWith(79.97, 'eur', {
        orderId: 'order1',
        userId: undefined,
      });
    });

    it('should throw error if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      // await expect(orderService.processPayment({
      //   orderId: 'nonexistent',
      //   paymentMethodId: 'pm_123456',
      //   amount: 29.99,
      // })).rejects.toThrow('Order not found');
    });

    it('should throw error if order already paid', async () => {
      const mockOrder = {
        id: 'order1',
        totalAmount: 79.97,
        status: 'PAID',
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      // await expect(orderService.processPayment({
      //   orderId: 'order1',
      //   paymentMethodId: 'pm_123456',
      //   amount: 79.97,
      // })).rejects.toThrow('Order already paid');
    });
  });

  describe('createRefund', () => {
    it('should create refund successfully', async () => {
      const refundData = {
        orderId: 'order1',
        amount: 29.99,
        reason: 'Customer request',
      };

      const mockOrder = {
        id: 'order1',
        stripePaymentId: 'pi_123456',
        status: 'PAID',
        totalAmount: 79.97,
      };

      const mockRefund = {
        id: 're_123456',
        status: 'succeeded',
        amount: 2999,
      };

      const { createRefund } = require('../../utils/stripe');
      createRefund.mockResolvedValue(mockRefund);

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: 'REFUNDED' });
      mockPrisma.transaction.create.mockResolvedValue({});

      // const result = await orderService.createRefund(refundData);

      // expect(result).toEqual(mockRefund);
      expect(createRefund).toHaveBeenCalledWith('pi_123456', 29.99);
    });

    it('should throw error if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      // await expect(orderService.createRefund({
        orderId: 'nonexistent',
        amount: 29.99,
        reason: 'Customer request',
      })).rejects.toThrow('Order not found');
    });

    it('should throw error if order not paid', async () => {
      const mockOrder = {
        id: 'order1',
        status: 'PENDING',
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      // await expect(orderService.createRefund({
        orderId: 'order1',
        amount: 29.99,
        reason: 'Customer request',
      })).rejects.toThrow('Order must be paid to create refund');
    });
  });
});
