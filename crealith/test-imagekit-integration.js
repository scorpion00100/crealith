#!/usr/bin/env node

/**
 * Script de test complet pour l'intégration ImageKit
 * Ce script teste toutes les fonctionnalités ImageKit
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testBackendAPI() {
  log('\n🔧 Test de l\'API Backend...', 'blue');
  
  try {
    // Test de l'API principale
    const apiResponse = await makeRequest(`${BACKEND_URL}/api`);
    if (apiResponse.status === 200) {
      log('✅ API principale accessible', 'green');
      log(`   Endpoints disponibles: ${Object.keys(apiResponse.data.endpoints || {}).join(', ')}`);
    } else {
      log('❌ API principale non accessible', 'red');
      return false;
    }

    // Test de l'endpoint ImageKit (sans auth - devrait retourner 401)
    const imagekitResponse = await makeRequest(`${BACKEND_URL}/api/imagekit/auth`);
    if (imagekitResponse.status === 401) {
      log('✅ Endpoint ImageKit protégé (authentification requise)', 'green');
    } else {
      log('❌ Endpoint ImageKit non protégé', 'red');
      return false;
    }

    return true;
  } catch (error) {
    log(`❌ Erreur lors du test backend: ${error.message}`, 'red');
    return false;
  }
}

async function testFrontend() {
  log('\n🎨 Test du Frontend...', 'blue');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200 && response.data.includes('Vite + React + TS')) {
      log('✅ Frontend accessible', 'green');
      return true;
    } else {
      log('❌ Frontend non accessible', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur lors du test frontend: ${error.message}`, 'red');
    return false;
  }
}

async function testImageKitConfiguration() {
  log('\n🖼️ Test de la configuration ImageKit...', 'blue');
  
  // Vérifier les fichiers de configuration
  const configFiles = [
    'frontend/src/config/imagekit.ts',
    'frontend/src/components/ui/ImageUpload.tsx',
    'frontend/src/components/ui/ImageDisplay.tsx',
    'frontend/src/components/ui/ProductImageUpload.tsx',
    'backend/src/services/imagekit.service.ts',
    'backend/src/routes/imagekit.routes.ts'
  ];

  let allFilesExist = true;
  for (const file of configFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} manquant`, 'red');
      allFilesExist = false;
    }
  }

  // Vérifier les variables d'environnement
  log('\n📋 Vérification des variables d\'environnement...', 'yellow');
  
  const envFiles = [
    'frontend/.env',
    'frontend/env.example',
    'backend/.env',
    'backend/env.example'
  ];

  for (const envFile of envFiles) {
    const filePath = path.join(__dirname, envFile);
    if (fs.existsSync(filePath)) {
      log(`✅ ${envFile}`, 'green');
      
      // Vérifier le contenu pour ImageKit
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('IMAGEKIT')) {
        log(`   Contient des variables ImageKit`, 'green');
      } else {
        log(`   ⚠️  Pas de variables ImageKit détectées`, 'yellow');
      }
    } else {
      log(`❌ ${envFile} manquant`, 'red');
    }
  }

  return allFilesExist;
}

async function testDependencies() {
  log('\n📦 Test des dépendances...', 'blue');
  
  // Vérifier package.json frontend
  const frontendPackagePath = path.join(__dirname, 'frontend/package.json');
  if (fs.existsSync(frontendPackagePath)) {
    const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
    if (frontendPackage.dependencies && frontendPackage.dependencies['imagekitio-react']) {
      log('✅ imagekitio-react installé (frontend)', 'green');
    } else {
      log('❌ imagekitio-react non installé (frontend)', 'red');
    }
  }

  // Vérifier package.json backend
  const backendPackagePath = path.join(__dirname, 'backend/package.json');
  if (fs.existsSync(backendPackagePath)) {
    const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
    if (backendPackage.dependencies && backendPackage.dependencies['imagekit']) {
      log('✅ imagekit installé (backend)', 'green');
    } else {
      log('❌ imagekit non installé (backend)', 'red');
    }
  }
}

async function testImageKitComponents() {
  log('\n🧩 Test des composants ImageKit...', 'blue');
  
  // Vérifier que les composants sont exportés
  const uiIndexPath = path.join(__dirname, 'frontend/src/components/ui/index.ts');
  if (fs.existsSync(uiIndexPath)) {
    const content = fs.readFileSync(uiIndexPath, 'utf8');
    const imagekitExports = [
      'ImageUpload',
      'ImageDisplay',
      'ProductImageUpload'
    ];
    
    for (const exportName of imagekitExports) {
      if (content.includes(exportName)) {
        log(`✅ ${exportName} exporté`, 'green');
      } else {
        log(`❌ ${exportName} non exporté`, 'red');
      }
    }
  }
}

async function runAllTests() {
  log('🚀 Démarrage des tests d\'intégration ImageKit...', 'bold');
  log('=' * 50, 'blue');
  
  const results = {
    backend: await testBackendAPI(),
    frontend: await testFrontend(),
    configuration: await testImageKitConfiguration(),
    dependencies: await testDependencies(),
    components: await testImageKitComponents()
  };
  
  log('\n📊 Résumé des tests:', 'bold');
  log('=' * 30, 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSÉ' : '❌ ÉCHOUÉ';
    const color = passed ? 'green' : 'red';
    log(`${test.toUpperCase()}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 Tous les tests sont passés !', 'green');
    log('Votre intégration ImageKit est prête à l\'emploi.', 'green');
    log('\n📋 Prochaines étapes:', 'yellow');
    log('1. Configurez vos clés ImageKit dans les fichiers .env', 'yellow');
    log('2. Redémarrez vos serveurs', 'yellow');
    log('3. Testez les composants dans votre application', 'yellow');
    log('4. Visitez /imagekit-test pour les tests interactifs', 'yellow');
  } else {
    log('\n⚠️  Certains tests ont échoué.', 'red');
    log('Veuillez corriger les problèmes avant de continuer.', 'red');
  }
  
  return allPassed;
}

// Exécuter les tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
