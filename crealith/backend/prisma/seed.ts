import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Nettoyer les données existantes
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Créer des catégories
  console.log('📁 Création des catégories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Templates Web',
        description: 'Templates et thèmes pour sites web',
        slug: 'templates',
        icon: '🌐',
      },
    }),
    prisma.category.create({
      data: {
        name: 'UI Kits',
        description: 'Kits d\'interface utilisateur et composants',
        slug: 'ui-kits',
        icon: '🎨',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Dashboards',
        description: 'Tableaux de bord et interfaces d\'administration',
        slug: 'dashboards',
        icon: '📊',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Illustrations',
        description: 'Illustrations et graphiques vectoriels',
        slug: 'illustrations',
        icon: '🎭',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Icons',
        description: 'Icônes et symboles',
        slug: 'icons',
        icon: '🔗',
      },
    }),
  ]);

  // Créer des utilisateurs (vendeurs et acheteurs)
  console.log('👥 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    // Vendeurs
    prisma.user.create({
      data: {
        email: 'designer@crealith.com',
        passwordHash: hashedPassword,
        firstName: 'Marie',
        lastName: 'Designer',
        role: UserRole.SELLER,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        bio: 'Designer UI/UX passionnée par la création d\'interfaces modernes',
      },
    }),
    prisma.user.create({
      data: {
        email: 'developer@crealith.com',
        passwordHash: hashedPassword,
        firstName: 'Pierre',
        lastName: 'Developer',
        role: UserRole.SELLER,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        bio: 'Développeur full-stack spécialisé en React et Node.js',
      },
    }),
    prisma.user.create({
      data: {
        email: 'creative@crealith.com',
        passwordHash: hashedPassword,
        firstName: 'Sophie',
        lastName: 'Creative',
        role: UserRole.SELLER,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        bio: 'Créatrice d\'illustrations et d\'icônes modernes',
      },
    }),
    // Acheteurs
    prisma.user.create({
      data: {
        email: 'buyer1@crealith.com',
        passwordHash: hashedPassword,
        firstName: 'Jean',
        lastName: 'Acheteur',
        role: UserRole.BUYER,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        bio: 'Entrepreneur à la recherche de ressources créatives',
      },
    }),
    prisma.user.create({
      data: {
        email: 'buyer2@crealith.com',
        passwordHash: hashedPassword,
        firstName: 'Alice',
        lastName: 'Client',
        role: UserRole.BUYER,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        bio: 'Freelance designer en quête d\'inspiration',
      },
    }),
  ]);

  // Créer des produits
  console.log('🛍️ Création des produits...');
  const products = await Promise.all([
    // Templates Web
    prisma.product.create({
      data: {
        title: 'Dashboard Analytics Pro',
        description: 'Dashboard moderne et professionnel pour applications web avec graphiques interactifs et widgets personnalisables. Parfait pour les applications SaaS et les tableaux de bord d\'entreprise.',
        shortDescription: 'Dashboard analytics moderne avec graphiques interactifs',
        price: 29.99,
        originalPrice: 49.99,
        previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        fileUrl: '/files/dashboard-analytics-pro.zip',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        fileSize: 15200,
        fileType: 'zip',
        downloadsCount: 1250,
        tags: ['dashboard', 'analytics', 'admin', 'react', 'typescript'],
        isActive: true,
        isFeatured: true,
        userId: users[0].id,
        categoryId: categories[2].id, // Dashboards
      },
    }),
    prisma.product.create({
      data: {
        title: 'E-commerce Template',
        description: 'Template e-commerce complet avec panier, paiement et gestion des produits intégrée. Design responsive et moderne, parfait pour les boutiques en ligne.',
        shortDescription: 'Template e-commerce complet et responsive',
        price: 39.99,
        originalPrice: 59.99,
        previewUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        fileUrl: '/files/ecommerce-template.zip',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
        fileSize: 25800,
        fileType: 'zip',
        downloadsCount: 2100,
        tags: ['e-commerce', 'template', 'shop', 'responsive', 'react'],
        isActive: true,
        isFeatured: true,
        userId: users[1].id,
        categoryId: categories[0].id, // Templates Web
      },
    }),
    prisma.product.create({
      data: {
        title: 'Portfolio Template',
        description: 'Template de portfolio moderne et élégant pour créatifs et développeurs. Design épuré avec animations fluides et sections personnalisables.',
        shortDescription: 'Template portfolio moderne pour créatifs',
        price: 24.99,
        originalPrice: 39.99,
        previewUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        fileUrl: '/files/portfolio-template.zip',
        thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        fileSize: 18700,
        fileType: 'zip',
        downloadsCount: 950,
        tags: ['portfolio', 'template', 'creative', 'responsive', 'html'],
        isActive: true,
        isFeatured: false,
        userId: users[0].id,
        categoryId: categories[0].id, // Templates Web
      },
    }),
    // UI Kits
    prisma.product.create({
      data: {
        title: 'UI Kit Minimalist',
        description: 'Kit d\'interface utilisateur minimaliste avec composants modernes et système de design cohérent. Inclut plus de 50 composants réutilisables.',
        shortDescription: 'Kit UI minimaliste avec composants modernes',
        price: 19.99,
        originalPrice: 29.99,
        previewUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
        fileUrl: '/files/ui-kit-minimalist.fig',
        thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
        fileSize: 8500,
        fileType: 'fig',
        downloadsCount: 890,
        tags: ['ui-kit', 'minimalist', 'components', 'figma', 'design'],
        isActive: true,
        isFeatured: false,
        userId: users[0].id,
        categoryId: categories[1].id, // UI Kits
      },
    }),
    // Illustrations
    prisma.product.create({
      data: {
        title: 'Illustration Pack',
        description: 'Pack d\'illustrations vectorielles modernes pour vos projets créatifs. Plus de 100 illustrations en format SVG et PNG haute résolution.',
        shortDescription: 'Pack d\'illustrations vectorielles modernes',
        price: 19.99,
        previewUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        fileUrl: '/files/illustration-pack.zip',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        fileSize: 22100,
        fileType: 'zip',
        downloadsCount: 3200,
        tags: ['illustration', 'art', 'vector', 'graphics', 'svg'],
        isActive: true,
        isFeatured: true,
        userId: users[2].id,
        categoryId: categories[3].id, // Illustrations
      },
    }),
    // Icons
    prisma.product.create({
      data: {
        title: 'Mobile App Icons',
        description: 'Collection complète d\'icônes pour applications mobiles avec formats SVG et PNG. Plus de 500 icônes dans différents styles.',
        shortDescription: 'Collection d\'icônes pour applications mobiles',
        price: 14.99,
        previewUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
        fileUrl: '/files/mobile-app-icons.zip',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
        fileSize: 12300,
        fileType: 'zip',
        downloadsCount: 1800,
        tags: ['icons', 'mobile', 'app', 'svg', 'png'],
        isActive: true,
        isFeatured: false,
        userId: users[2].id,
        categoryId: categories[4].id, // Icons
      },
    }),
    // Plus de produits pour enrichir le catalogue
    prisma.product.create({
      data: {
        title: 'Admin Dashboard',
        description: 'Dashboard d\'administration complet avec gestion des utilisateurs et statistiques. Interface moderne avec React et TypeScript.',
        shortDescription: 'Dashboard d\'administration complet',
        price: 49.99,
        originalPrice: 79.99,
        previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        fileUrl: '/files/admin-dashboard.zip',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        fileSize: 35400,
        fileType: 'zip',
        downloadsCount: 2100,
        tags: ['admin', 'dashboard', 'management', 'react', 'typescript'],
        isActive: true,
        isFeatured: true,
        userId: users[1].id,
        categoryId: categories[2].id, // Dashboards
      },
    }),
    prisma.product.create({
      data: {
        title: 'Landing Page Template',
        description: 'Template de landing page moderne et optimisée pour les conversions. Design responsive avec animations et sections personnalisables.',
        shortDescription: 'Template landing page optimisé conversions',
        price: 34.99,
        originalPrice: 49.99,
        previewUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        fileUrl: '/files/landing-page-template.zip',
        thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        fileSize: 19800,
        fileType: 'zip',
        downloadsCount: 1450,
        tags: ['landing', 'template', 'conversion', 'responsive', 'html'],
        isActive: true,
        isFeatured: false,
        userId: users[0].id,
        categoryId: categories[0].id, // Templates Web
      },
    }),
  ]);

  // Créer quelques avis
  console.log('⭐ Création des avis...');
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Excellent template ! Très facile à personnaliser et le design est moderne.',
        userId: users[3].id,
        productId: products[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Très bon produit, la documentation pourrait être améliorée.',
        userId: users[4].id,
        productId: products[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Parfait pour mon projet e-commerce ! Je recommande vivement.',
        userId: users[3].id,
        productId: products[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Belles illustrations, qualité professionnelle.',
        userId: users[4].id,
        productId: products[4].id,
      },
    }),
  ]);

  console.log('✅ Seeding terminé avec succès !');
  console.log(`📊 Résumé :`);
  console.log(`   - ${categories.length} catégories créées`);
  console.log(`   - ${users.length} utilisateurs créés`);
  console.log(`   - ${products.length} produits créés`);
  console.log(`   - 4 avis créés`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });