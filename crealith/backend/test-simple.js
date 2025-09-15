require('dotenv').config();
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

console.log('🚀 Test simple du système Crealith...\n');

// Test Redis
async function testRedis() {
  console.log('🔍 Test Redis...');
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  });

  try {
    const ping = await redis.ping();
    console.log('✅ Redis:', ping);
    await redis.quit();
    return true;
  } catch (error) {
    console.error('❌ Redis:', error.message);
    return false;
  }
}

// Test JWT
function testJWT() {
  console.log('\n🔐 Test JWT...');
  try {
    const payload = { userId: 'test', email: 'test@test.com', role: 'BUYER' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('✅ JWT:', decoded.userId);
    return true;
  } catch (error) {
    console.error('❌ JWT:', error.message);
    return false;
  }
}

// Test SMTP
async function testSMTP() {
  console.log('\n📧 Test SMTP...');
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    await transporter.verify();
    console.log('✅ SMTP: Configuration valide');
    return true;
  } catch (error) {
    console.error('❌ SMTP:', error.message);
    return false;
  }
}

// Test complet
async function runTests() {
  const redisOk = await testRedis();
  const jwtOk = testJWT();
  const smtpOk = await testSMTP();

  console.log('\n📊 Résumé des tests:');
  console.log('- Redis:', redisOk ? '✅' : '❌');
  console.log('- JWT:', jwtOk ? '✅' : '❌');
  console.log('- SMTP:', smtpOk ? '✅' : '❌');

  if (redisOk && jwtOk && smtpOk) {
    console.log('\n🎉 Tous les tests sont passés !');
    console.log('✅ Le système est prêt à fonctionner');
  } else {
    console.log('\n❌ Certains tests ont échoué');
    process.exit(1);
  }
}

runTests();
