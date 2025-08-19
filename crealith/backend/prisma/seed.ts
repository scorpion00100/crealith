import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Templates', description: 'Website templates', slug: 'templates', icon: '🎨' }
    }),
    prisma.category.create({
      data: { name: 'eBooks', description: 'Digital books', slug: 'ebooks', icon: '📚' }
    }),
    prisma.category.create({
      data: { name: 'Code', description: 'Scripts and plugins', slug: 'code', icon: '💻' }
    })
  ]);

  const hashedPassword = await bcrypt.hash('password123', 12);

  const [admin, seller, buyer] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@crealith.com', passwordHash: hashedPassword,
        firstName: 'Admin', lastName: 'Crealith', role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        email: 'seller@crealith.com', passwordHash: hashedPassword,
        firstName: 'Alice', lastName: 'Seller', role: 'SELLER'
      }
    }),
    prisma.user.create({
      data: {
        email: 'buyer@crealith.com', passwordHash: hashedPassword,
        firstName: 'John', lastName: 'Buyer', role: 'BUYER'
      }
    })
  ]);

  await prisma.product.create({
    data: {
      title: 'Modern Business Template',
      description: 'Complete business website template',
      price: 49.99,
      fileUrl: 'https://picsum.photos/800/600?random=1',
      thumbnailUrl: 'https://picsum.photos/400/300?random=1',
      fileSize: 25600000,
      fileType: 'application/zip',
      tags: ['html', 'css', 'business'],
      isFeatured: true,
      userId: seller.id,
      categoryId: categories[0].id
    }
  });

  console.log('✅ Seed completed!');
  console.log('Login: admin@crealith.com / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
