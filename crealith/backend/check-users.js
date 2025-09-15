reconst { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateUsers() {
  console.log('🔍 Vérification des utilisateurs...');
  
  // Vérifier les utilisateurs existants
  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: ['danbetheliryivuze@gmail.com', 'dbetiryivuze@gmail.com']
      }
    }
  });
  
  console.log('👥 Utilisateurs existants trouvés :');
  existingUsers.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - Vérifié: ${user.emailVerified}`);
  });
  
  // Créer les utilisateurs manquants
  const emails = ['danbetheliryivuze@gmail.com', 'dbetiryivuze@gmail.com'];
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  for (const email of emails) {
    const existingUser = existingUsers.find(u => u.email === email);
    
    if (!existingUser) {
      console.log(`\n➕ Création de l'utilisateur ${email}...`);
      
      try {
        const user = await prisma.user.create({
          data: {
            email: email,
            passwordHash: hashedPassword,
            firstName: email.includes('danbethel') ? 'Dan' : 'Dan',
            lastName: 'Bethel',
            role: 'BUYER',
            emailVerified: true,
            bio: 'Utilisateur de test Crealith'
          }
        });
        
        console.log(`✅ Utilisateur créé avec succès : ${user.email}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${email}:`, error.message);
      }
    } else {
      // Mettre à jour l'utilisateur existant pour s'assurer qu'il est vérifié
      if (!existingUser.emailVerified) {
        console.log(`\n🔄 Mise à jour de l'utilisateur ${email}...`);
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null
          }
        });
        
        console.log(`✅ Utilisateur ${email} mis à jour et vérifié`);
      } else {
        console.log(`✅ Utilisateur ${email} existe déjà et est vérifié`);
      }
    }
  }
  
  // Afficher tous les utilisateurs finaux
  console.log('\n📊 Utilisateurs finaux :');
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        in: ['danbetheliryivuze@gmail.com', 'dbetiryivuze@gmail.com']
      }
    }
  });
  
  allUsers.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - Vérifié: ${user.emailVerified} - ID: ${user.id}`);
  });
}

checkAndCreateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
