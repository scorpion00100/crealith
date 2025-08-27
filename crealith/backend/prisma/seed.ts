import { PrismaClient, Prisma } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Nettoyer la base de données
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Créer les catégories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Templates Web',
        description: 'Templates et thèmes pour sites web',
        slug: 'templates-web',
        icon: '🌐',
      },
    }),
    prisma.category.create({
      data: {
        name: 'UI Kits',
        description: 'Kits d\'interface utilisateur',
        slug: 'ui-kits',
        icon: '🎨',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Dashboards',
        description: 'Tableaux de bord et analytics',
        slug: 'dashboards',
        icon: '📊',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mobile Apps',
        description: 'Applications mobiles et templates',
        slug: 'mobile-apps',
        icon: '📱',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Illustrations',
        description: 'Illustrations et graphiques',
        slug: 'illustrations',
        icon: '🎭',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Créer les utilisateurs
  const passwordHash = await hashPassword('password123');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@crealith.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=dc2626&color=fff',
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller1@crealith.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Designer',
        role: 'SELLER',
        avatar: 'https://ui-avatars.com/api/?name=John+Designer&background=059669&color=fff',
        bio: 'Designer créatif passionné par l\'UI/UX',
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller2@crealith.com',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Developer',
        role: 'SELLER',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Developer&background=7c3aed&color=fff',
        bio: 'Développeuse full-stack spécialisée en React',
      },
    }),
    prisma.user.create({
      data: {
        email: 'buyer1@crealith.com',
        passwordHash,
        firstName: 'Mike',
        lastName: 'Buyer',
        role: 'BUYER',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Buyer&background=ea580c&color=fff',
      },
    }),
    prisma.user.create({
      data: {
        email: 'buyer2@crealith.com',
        passwordHash,
        firstName: 'Emma',
        lastName: 'Creator',
        role: 'BUYER',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Creator&background=be185d&color=fff',
      },
    }),
  ]);

  console.log('✅ Users created');

  // Créer les produits
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Dashboard Analytics Pro',
        description: 'Un tableau de bord moderne et responsive pour les analytics avec des graphiques interactifs et des widgets personnalisables.',
        shortDescription: 'Dashboard analytics moderne avec graphiques interactifs',
        price: new Prisma.Decimal(49.99),
        originalPrice: new Prisma.Decimal(79.99),
        fileUrl: 'https://via.placeholder.com/800x600?text=Dashboard+Analytics+Pro',
        thumbnailUrl: 'https://via.placeholder.com/400x300?text=Dashboard+Analytics+Pro',
        fileSize: 2048576,
        fileType: 'application/zip',
        downloadsCount: 1250,
        tags: ['dashboard', 'analytics', 'react', 'typescript'],
        isActive: true,
        isFeatured: true,
        userId: users[1].id, // John Designer
        categoryId: categories[2].id, // Dashboards
      },
    }),
    prisma.product.create({
      data: {
        title: 'E-commerce UI Kit',
        description: 'Kit complet d\'interface utilisateur pour e-commerce avec pages produit, panier, checkout et admin panel.',
        shortDescription: 'Kit UI complet pour e-commerce',
        price: new Prisma.Decimal(39.99),
        fileUrl: 'https://via.placeholder.com/800x600?text=E-commerce+UI+Kit',
        thumbnailUrl: 'https://via.placeholder.com/400x300?text=E-commerce+UI+Kit',
        fileSize: 1536000,
        fileType: 'application/zip',
        downloadsCount: 890,
        tags: ['e-commerce', 'ui-kit', 'figma', 'sketch'],
        isActive: true,
        isFeatured: true,
        userId: users[2].id, // Sarah Developer
        categoryId: categories[1].id, // UI Kits
      },
    }),
    prisma.product.create({
      data: {
        title: 'Portfolio Template',
        description: 'Template de portfolio élégant et professionnel avec animations fluides et design responsive.',
        shortDescription: 'Template portfolio élégant et responsive',
        price: new Prisma.Decimal(29.99),
        fileUrl: 'https://via.placeholder.com/800x600?text=Portfolio+Template',
        thumbnailUrl: 'https://via.placeholder.com/400x300?text=Portfolio+Template',
        fileSize: 1024000,
        fileType: 'application/zip',
        downloadsCount: 567,
        tags: ['portfolio', 'template', 'html', 'css'],
        isActive: true,
        isFeatured: false,
        userId: users[1].id, // John Designer
        categoryId: categories[0].id, // Templates Web
      },
    }),
    prisma.product.create({
      data: {
        title: 'Mobile App Template',
        description: 'Template d\'application mobile moderne avec navigation fluide et composants réutilisables.',
        shortDescription: 'Template app mobile moderne',
        price: new Prisma.Decimal(34.99),
        fileUrl: 'https://via.placeholder.com/800x600?text=Mobile+App+Template',
        thumbnailUrl: 'https://via.placeholder.com/400x300?text=Mobile+App+Template',
        fileSize: 1792000,
        fileType: 'application/zip',
        downloadsCount: 423,
        tags: ['mobile', 'app', 'react-native', 'flutter'],
        isActive: true,
        isFeatured: false,
        userId: users[2].id, // Sarah Developer
        categoryId: categories[3].id, // Mobile Apps
      },
    }),
    prisma.product.create({
      data: {
        title: 'Illustration Pack',
        description: 'Pack de 50 illustrations vectorielles modernes pour vos projets créatifs.',
        shortDescription: '50 illustrations vectorielles modernes',
        price: new Prisma.Decimal(19.99),
        fileUrl: 'https://via.placeholder.com/800x600?text=Illustration+Pack',
        thumbnailUrl: 'https://via.placeholder.com/400x300?text=Illustration+Pack',
        fileSize: 512000,
        fileType: 'application/zip',
        downloadsCount: 789,
        tags: ['illustrations', 'vector', 'svg', 'design'],
        isActive: true,
        isFeatured: true,
        userId: users[1].id, // John Designer
        categoryId: categories[4].id, // Illustrations
      },
    }),
  ]);

  console.log('✅ Products created');

  // Créer quelques commandes
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-20241201-001',
        totalAmount: new Prisma.Decimal(49.99),
        status: 'PAID',
        paymentMethod: 'card',
        userId: users[3].id, // Mike Buyer
        items: {
          create: {
            productId: products[0].id,
            quantity: 1,
            price: new Prisma.Decimal(49.99),
          },
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-20241201-002',
        totalAmount: new Prisma.Decimal(69.98),
        status: 'PAID',
        paymentMethod: 'card',
        userId: users[4].id, // Emma Creator
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: new Prisma.Decimal(39.99),
            },
            {
              productId: products[4].id,
              quantity: 1,
              price: new Prisma.Decimal(19.99),
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Orders created');

  // Créer quelques avis
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Excellent dashboard, très facile à personnaliser !',
        userId: users[3].id, // Mike Buyer
        productId: products[0].id, // Dashboard Analytics Pro
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Kit UI de qualité, parfait pour mon projet e-commerce.',
        userId: users[4].id, // Emma Creator
        productId: products[1].id, // E-commerce UI Kit
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Illustrations magnifiques, je recommande !',
        userId: users[4].id, // Emma Creator
        productId: products[4].id, // Illustration Pack
      },
    }),
  ]);

  console.log('✅ Reviews created');

  // Créer des favoris
  const favorites = await Promise.all([
    prisma.favorite.create({
      data: {
        userId: users[3].id, // Mike Buyer
        productId: products[0].id, // Dashboard Analytics Pro
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[3].id, // Mike Buyer
        productId: products[1].id, // E-commerce UI Kit
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[4].id, // Emma Creator
        productId: products[0].id, // Dashboard Analytics Pro
      },
    }),
  ]);

  console.log('✅ Favorites created');

  // Créer quelques items dans le panier
  const cartItems = await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: users[3].id, // Mike Buyer
        productId: products[2].id, // Portfolio Template
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[4].id, // Emma Creator
        productId: products[3].id, // Mobile App Template
        quantity: 1,
      },
    }),
  ]);

  console.log('✅ Cart items created');

  console.log('🎉 Database seeded successfully!');
  console.log(`📊 Created ${categories.length} categories`);
  console.log(`👥 Created ${users.length} users`);
  console.log(`📦 Created ${products.length} products`);
  console.log(`🛒 Created ${orders.length} orders`);
  console.log(`⭐ Created ${reviews.length} reviews`);
  console.log(`🛍️ Created ${cartItems.length} cart items`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
