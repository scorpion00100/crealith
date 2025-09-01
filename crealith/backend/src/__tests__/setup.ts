import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_secret_123'
      })
    },
    accounts: {
      create: jest.fn().mockResolvedValue({
        id: 'acct_test_123'
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'acct_test_123',
        charges_enabled: true,
        payouts_enabled: true
      })
    },
    accountLinks: {
      create: jest.fn().mockResolvedValue({
        url: 'https://connect.stripe.com/test/oauth/authorize'
      })
    },
    transfers: {
      create: jest.fn().mockResolvedValue({
        id: 'tr_test_123'
      })
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_test_123'
      })
    },
    balance: {
      retrieve: jest.fn().mockResolvedValue({
        available: [{ amount: 1000, currency: 'eur' }]
      })
    }
  }));
});

// Mock ImageKit
jest.mock('imagekit', () => {
  return jest.fn().mockImplementation(() => ({
    url: jest.fn().mockReturnValue('https://test-imagekit-url.com/signed-url')
  }));
});

// Setup global
beforeAll(async () => {
  // Nettoyer la base de données de test
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
});

// Teardown global
afterAll(async () => {
  await prisma.$disconnect();
});

// Nettoyer après chaque test
afterEach(async () => {
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
});
