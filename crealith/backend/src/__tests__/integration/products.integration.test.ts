import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken } from '../../utils/jwt';

const prisma = new PrismaClient();

describe('Products Integration Tests', () => {
  let testUser: any;
  let testCategory: any;
  let testProduct: any;
  let accessToken: string;

  beforeAll(async () => {
    // Créer un utilisateur de test
    testUser = await prisma.user.create({
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

    // Créer une catégorie de test
    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test category description',
        slug: 'test-category',
        isActive: true
      }
    });

    // Générer un token d'accès
    accessToken = generateAccessToken({ userId: testUser.id, email: testUser.email, role: testUser.role });

    // Nettoyer les produits de test existants
    await prisma.product.deleteMany({
      where: {
        title: {
          contains: 'Test Product'
        }
      }
    });
  });

  afterAll(async () => {
    // Nettoyer après les tests
    if (testProduct) {
      await prisma.product.delete({
        where: { id: testProduct.id }
      });
    }
    if (testCategory) {
      await prisma.category.delete({
        where: { id: testCategory.id }
      });
    }
    if (testUser) {
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test product description',
        price: 29.99,
        categoryId: testCategory.id,
        stock: 100,
        isActive: true
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(productData.name);
      expect(response.body.product.price).toBe(productData.price);
      expect(response.body.product.sellerId).toBe(testUser.id);

      testProduct = response.body.product;
    });

    it('should fail to create product without authentication', async () => {
      const productData = {
        name: 'Test Product 2',
        description: 'Test product description',
        price: 29.99,
        categoryId: testCategory.id,
        stock: 100
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create product with invalid data', async () => {
      const productData = {
        name: '', // Nom vide
        description: 'Test product description',
        price: -10, // Prix négatif
        categoryId: testCategory.id,
        stock: 100
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create product with non-existent category', async () => {
      const productData = {
        name: 'Test Product 3',
        description: 'Test product description',
        price: 29.99,
        categoryId: 'non-existent-id',
        stock: 100
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/products', () => {
    it('should get all products with pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({
          categoryId: testCategory.id
        })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      
      // Vérifier que tous les produits retournés appartiennent à la catégorie
      response.body.products.forEach((product: any) => {
        expect(product.categoryId).toBe(testCategory.id);
      });
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({
          search: 'Test Product'
        })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      
      // Vérifier que tous les produits retournés contiennent le terme de recherche
      response.body.products.forEach((product: any) => {
        expect(product.name.toLowerCase()).toContain('test product');
      });
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({
          minPrice: 20,
          maxPrice: 50
        })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      
      // Vérifier que tous les produits sont dans la fourchette de prix
      response.body.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(20);
        expect(product.price).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a specific product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.id).toBe(testProduct.id);
      expect(response.body.product.name).toBe(testProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product with valid data', async () => {
      const updateData = {
        name: 'Updated Test Product',
        description: 'Updated description',
        price: 39.99,
        stock: 150
      };

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(updateData.name);
      expect(response.body.product.price).toBe(updateData.price);
      expect(response.body.product.stock).toBe(updateData.stock);
    });

    it('should fail to update product without authentication', async () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 39.99
      };

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to update product with invalid data', async () => {
      const updateData = {
        name: '', // Nom vide
        price: -10 // Prix négatif
      };

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product with valid authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail to delete product without authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Product Reviews', () => {
    let reviewUser: any;
    let reviewAccessToken: string;

    beforeAll(async () => {
      // Créer un utilisateur pour les avis
      reviewUser = await prisma.user.create({
        data: {
          email: 'test-reviewer@example.com',
          passwordHash: '$2b$10$hashedpassword',
          firstName: 'Test',
          lastName: 'Reviewer',
          role: 'BUYER',
          isActive: true,
          // emailVerified: true
        }
      });

      reviewAccessToken = generateAccessToken({ userId: reviewUser.id, email: reviewUser.email, role: reviewUser.role });

      // Recréer le produit pour les tests d'avis
      testProduct = await prisma.product.create({
        data: {
          title: 'Test Product for Reviews',
          description: 'Test product description',
          price: 29.99,
          categoryId: testCategory.id,
          userId: testUser.id,
          // stock: 100,
          isActive: true
        }
      });
    });

    afterAll(async () => {
      if (reviewUser) {
        await prisma.user.delete({
          where: { id: reviewUser.id }
        });
      }
    });

    it('should create a product review', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Excellent product!'
      };

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/reviews`)
        .set('Authorization', `Bearer ${reviewAccessToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body).toHaveProperty('review');
      expect(response.body.review.rating).toBe(reviewData.rating);
      expect(response.body.review.comment).toBe(reviewData.comment);
      expect(response.body.review.userId).toBe(reviewUser.id);
    });

    it('should get product reviews', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.id}/reviews`)
        .expect(200);

      expect(response.body).toHaveProperty('reviews');
      expect(Array.isArray(response.body.reviews)).toBe(true);
      expect(response.body.reviews.length).toBeGreaterThan(0);
    });
  });
});
