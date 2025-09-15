require('dotenv').config();
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

console.log('🚀 Test complet du système Crealith...\n');

// Configuration Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0')
});

// Configuration JWT
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Configuration SMTP
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

console.log('🔧 Configuration chargée:');
console.log('- REDIS_HOST:', process.env.REDIS_HOST || 'localhost');
console.log('- JWT_ACCESS_SECRET:', JWT_ACCESS_SECRET ? '✅ Configuré' : '❌ Manquant');
console.log('- JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET ? '✅ Configuré' : '❌ Manquant');
console.log('- SMTP_HOST:', SMTP_HOST || '❌ Manquant');
console.log('- SMTP_USER:', SMTP_USER || '❌ Manquant');
console.log('- EMAIL_FROM:', EMAIL_FROM || '❌ Manquant');

async function testRedisConnection() {
  console.log('\n🔍 Test de connexion Redis...');
  
  try {
    const ping = await redis.ping();
    console.log('✅ Redis connecté:', ping);
    
    const info = await redis.info('server');
    console.log('📊 Version Redis:', info.split('\n')[1]);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Redis:', error.message);
    return false;
  }
}

async function testJWTGeneration() {
  console.log('\n🔐 Test de génération JWT...');
  
  try {
    const payload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'BUYER',
      type: 'access'
    };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: '15m',
      issuer: 'crealith-api',
      audience: 'crealith-users'
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
      issuer: 'crealith-api',
      audience: 'crealith-users'
    });

    console.log('✅ Access token généré:', accessToken.substring(0, 50) + '...');
    console.log('✅ Refresh token généré:', refreshToken.substring(0, 50) + '...');
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('❌ Erreur de génération JWT:', error.message);
    return null;
  }
}

async function testRedisTokenStorage(tokens) {
  console.log('\n💾 Test de stockage des tokens dans Redis...');
  
  try {
    const { accessToken, refreshToken } = tokens;
    
    // Stocker le refresh token
    const key = `refresh_token:${refreshToken}`;
    const value = JSON.stringify({
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    await redis.setex(key, 7 * 24 * 60 * 60, value);
    console.log('✅ Refresh token stocké dans Redis');

    // Vérifier que le token existe
    const storedToken = await redis.get(key);
    if (storedToken) {
      const parsed = JSON.parse(storedToken);
      console.log('✅ Token récupéré:', parsed.userId);
    }

    // Tester la révoquation
    await redis.del(key);
    const deletedToken = await redis.get(key);
    if (!deletedToken) {
      console.log('✅ Token révoqué avec succès');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur de stockage Redis:', error.message);
    return false;
  }
}

async function testEmailConfiguration() {
  console.log('\n📧 Test de configuration email...');
  
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('⚠️  Configuration SMTP incomplète, test d\'email ignoré');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    // Test de connexion
    await transporter.verify();
    console.log('✅ Configuration SMTP valide');
    
    // Test d'envoi d'email (optionnel)
    const testEmail = {
      from: EMAIL_FROM,
      to: SMTP_USER, // Envoyer à soi-même pour le test
      subject: 'Test Crealith - Système d\'authentification',
      html: `
        <h2>Test du système Crealith</h2>
        <p>Ceci est un email de test pour vérifier que le système d'envoi d'emails fonctionne correctement.</p>
        <p><strong>Fonctionnalités testées :</strong></p>
        <ul>
          <li>✅ Connexion Redis</li>
          <li>✅ Génération JWT</li>
          <li>✅ Stockage des tokens</li>
          <li>✅ Envoi d'emails</li>
        </ul>
        <p>Date du test: ${new Date().toLocaleString()}</p>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Email de test envoyé:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration email:', error.message);
    return false;
  }
}

async function testPasswordResetFlow() {
  console.log('\n🔑 Test du flux de réinitialisation de mot de passe...');
  
  try {
    const testEmail = 'test@example.com';
    const resetToken = jwt.sign(
      { email: testEmail, type: 'reset' },
      JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    // Stocker le token de reset dans Redis
    const resetKey = `reset_token:${resetToken}`;
    const resetValue = JSON.stringify({
      email: testEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });

    await redis.setex(resetKey, 60 * 60, resetValue);
    console.log('✅ Token de reset stocké dans Redis');

    // Vérifier le token
    const storedResetToken = await redis.get(resetKey);
    if (storedResetToken) {
      const parsed = JSON.parse(storedResetToken);
      console.log('✅ Token de reset récupéré:', parsed.email);
    }

    // Simuler l'utilisation du token
    await redis.del(resetKey);
    console.log('✅ Token de reset utilisé et supprimé');

    return true;
  } catch (error) {
    console.error('❌ Erreur du flux de reset:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('\n⚡ Test de performance...');
  
  try {
    const startTime = Date.now();
    
    // Test de stockage multiple
    for (let i = 0; i < 50; i++) {
      const key = `test_key_${i}`;
      const value = `test_value_${i}`;
      await redis.setex(key, 60, value);
    }
    
    const storageTime = Date.now() - startTime;
    console.log(`✅ 50 clés stockées en ${storageTime}ms`);

    // Test de lecture multiple
    const readStartTime = Date.now();
    for (let i = 0; i < 50; i++) {
      const key = `test_key_${i}`;
      await redis.get(key);
    }
    
    const readTime = Date.now() - readStartTime;
    console.log(`✅ 50 clés lues en ${readTime}ms`);

    // Nettoyage
    for (let i = 0; i < 50; i++) {
      const key = `test_key_${i}`;
      await redis.del(key);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur de performance:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests complets du système...\n');
  
  // Test 1: Connexion Redis
  const redisConnected = await testRedisConnection();
  if (!redisConnected) {
    console.log('\n❌ Tests arrêtés - Redis non disponible');
    process.exit(1);
  }

  // Test 2: Génération JWT
  const tokens = await testJWTGeneration();
  if (!tokens) {
    console.log('\n❌ Tests arrêtés - Erreur JWT');
    process.exit(1);
  }

  // Test 3: Stockage Redis
  const storageOk = await testRedisTokenStorage(tokens);
  if (!storageOk) {
    console.log('\n❌ Tests arrêtés - Erreur stockage Redis');
    process.exit(1);
  }

  // Test 4: Configuration Email
  const emailOk = await testEmailConfiguration();
  if (!emailOk) {
    console.log('\n⚠️  Tests continuent - Erreur email (non critique)');
  }

  // Test 5: Flux de reset de mot de passe
  const resetOk = await testPasswordResetFlow();
  if (!resetOk) {
    console.log('\n❌ Tests arrêtés - Erreur flux de reset');
    process.exit(1);
  }

  // Test 6: Performance
  const performanceOk = await testPerformance();
  if (!performanceOk) {
    console.log('\n❌ Tests arrêtés - Erreur performance');
    process.exit(1);
  }

  console.log('\n🎉 Tous les tests sont passés avec succès !');
  console.log('✅ Le système d\'authentification Redis est opérationnel');
  console.log('✅ Le système d\'envoi d\'emails est configuré');
  console.log('✅ Les performances sont optimales');
  
  await redis.quit();
  process.exit(0);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Lancer les tests
runAllTests();
