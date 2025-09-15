const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSellerAccount() {
  console.log('🛍️ Création d\'un compte vendeur...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  try {
    const seller = await prisma.user.create({
      data: {
        email: 'danbetheliryivuze@gmail.com',
        passwordHash: hashedPassword,
        firstName: 'Dan',
        lastName: 'Bethel',
        role: 'SELLER',
        emailVerified: true,
        bio: 'Vendeur de produits digitaux sur Crealith',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    });
    
    console.log('✅ Compte vendeur créé avec succès :');
    console.log(`- Email: ${seller.email}`);
    console.log(`- Rôle: ${seller.role}`);
    console.log(`- Vérifié: ${seller.emailVerified}`);
    console.log(`- ID: ${seller.id}`);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Un utilisateur avec cet email existe déjà.');
      console.log('🔄 Mise à jour du rôle vers SELLER...');
      
      const updatedUser = await prisma.user.update({
        where: { email: 'danbetheliryivuze@gmail.com' },
        data: { 
          role: 'SELLER',
          bio: 'Vendeur de produits digitaux sur Crealith'
        }
      });
      
      console.log('✅ Utilisateur mis à jour vers SELLER :');
      console.log(`- Email: ${updatedUser.email}`);
      console.log(`- Rôle: ${updatedUser.role}`);
    } else {
      console.error('❌ Erreur:', error.message);
    }
  }
}

createSellerAccount()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
