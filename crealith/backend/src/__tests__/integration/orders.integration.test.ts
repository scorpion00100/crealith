import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken } from '../../utils/jwt';

const prisma = new PrismaClient();

describe('Orders Integration Tests', () => {
  let buyer: any;
  let seller: any;
  let category: any;
  let product: any;
  let buyerToken: string;
  let sellerToken: string;

  beforeAll(async () => {
    // Créer un acheteur
    buyer = await prisma.user.create({
      data: {
        email: 'test-buyer@example.com',
        passwordHash: '$2b$10$hashedpassword',
        firstName: 'Test',
        lastName: 'Buyer',
        role: 'BUYER',
        isActive: true,
        // emailVerified: true
      }
    });

    // Créer un vendeur
    seller = await prisma.user.create({
      data: {
        email: 'test-seller@example.com',
        passwordHash: '$2b$10$hashedpassword',
        firstName: 'Test',
        lastName: 'Seller',
        role: 'SELLER',
        isActive: true,
        // emailVerified: true
      }
    });

    // Créer une catégorie
    category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test category description',
        slug: 'test-category',
        isActive: true
      }
    });

    // Créer un produit
    product = await prisma.product.create({
      data: {
        title: 'Test Product',
        description: 'Test product description',
        price: 29.99,
        categoryId: category.id,
        userId: seller.id,
        // stock: 100,
        isActive: true
      }
    });

    // Générer les tokens
    buyerToken = generateAccessToken({ userId: buyer.id, email: buyer.email, role: buyer.role });
    sellerToken = generateAccessToken({ userId: seller.id, email: seller.email, role: seller.role });

    // Nettoyer les commandes de test existantes
    await prisma.order.deleteMany({
      where: {
        userId: buyer.id
      }
    });
  });

  afterAll(async () => {
    // Nettoyer après les tests
    await prisma.order.deleteMany({
      where: {
        userId: buyer.id
      }
    });
    await prisma.product.delete({
      where: { id: product.id }
    });
    await prisma.category.delete({
      where: { id: category.id }
    });
    await prisma.user.delete({
      where: { id: buyer.id }
    });
    await prisma.user.delete({
      where: { id: seller.id }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/orders', () => {
    it('should create a new order with valid data', async () => {
      const orderData = {
        items: [
          {
            productId: product.id,
            quantity: 2,
            price: product.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order.userId).toBe(buyer.id);
      expect(response.body.order.status).toBe('PENDING');
      expect(response.body.order.items).toHaveLength(1);
      expect(response.body.order.items[0].productId).toBe(product.id);
      expect(response.body.order.items[0].quantity).toBe(2);
    });

    it('should fail to create order without authentication', async () => {
      const orderData = {
        items: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create order with invalid product', async () => {
      const orderData = {
        items: [
          {
            productId: 'non-existent-id',
            quantity: 1,
            price: 29.99
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create order with insufficient stock', async () => {
      const orderData = {
        items: [
          {
            productId: product.id,
            quantity: 1000, // Plus que le stock disponible
            price: product.price
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create order with empty items', async () => {
      const orderData = {
        items: []
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/orders', () => {
    let testOrder: any;

    beforeAll(async () => {
      // Créer une commande de test
      testOrder = await prisma.order.create({
        data: {
          userId: buyer.id,
          status: 'PENDING',
          totalAmount: 59.98,
          // shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
          },
          items: {
            create: [
              {
                productId: product.id,
                quantity: 2,
                price: product.price
              }
            ]
          }
        }
      });
    });

    it('should get user orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .query({
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .query({
          status: 'PENDING'
        })
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      
      // Vérifier que tous les ordres ont le statut PENDING
      response.body.orders.forEach((order: any) => {
        expect(order.status).toBe('PENDING');
      });
    });

    it('should fail to get orders without authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/orders/:id', () => {
    let testOrder: any;

    beforeAll(async () => {
      // Créer une commande de test
      testOrder = await prisma.order.create({
        data: {
          userId: buyer.id,
          status: 'PENDING',
          totalAmount: 29.99,
          // shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
          },
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                price: product.price
              }
            ]
          }
        }
      });
    });

    it('should get a specific order by ID', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order.id).toBe(testOrder.id);
      expect(response.body.order.userId).toBe(buyer.id);
    });

    it('should fail to get order without authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to get order of another user', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    let testOrder: any;

    beforeAll(async () => {
      // Créer une commande de test
      testOrder = await prisma.order.create({
        data: {
          userId: buyer.id,
          status: 'PENDING',
          totalAmount: 29.99,
          // shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
          },
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                price: product.price
              }
            ]
          }
        }
      });
    });

    it('should update order status as seller', async () => {
      const updateData = {
        status: 'CONFIRMED'
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order.status).toBe('CONFIRMED');
    });

    it('should fail to update order status without authentication', async () => {
      const updateData = {
        status: 'SHIPPED'
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to update order status with invalid status', async () => {
      const updateData = {
        status: 'INVALID_STATUS'
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to update order status as buyer', async () => {
      const updateData = {
        status: 'SHIPPED'
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Order Cancellation', () => {
    let testOrder: any;

    beforeAll(async () => {
      // Créer une commande de test
      testOrder = await prisma.order.create({
        data: {
          userId: buyer.id,
          status: 'PENDING',
          totalAmount: 29.99,
          // shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
          },
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                price: product.price
              }
            ]
          }
        }
      });
    });

    it('should cancel order as buyer', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order.status).toBe('CANCELLED');
    });

    it('should fail to cancel order without authentication', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/cancel`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to cancel order of another user', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });
});
