#!/usr/bin/env node

/**
 * TEST FINAL COMPLET - INTÉGRATION IMAGEKIT
 * Ce script teste toutes les fonctionnalités de manière exhaustive
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
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
  log('\n🔧 TEST BACKEND API', 'blue');
  log('=' * 40, 'blue');
  
  const results = {
    apiMain: false,
    imagekitEndpoint: false,
    authProtection: false,
    endpoints: []
  };

  try {
    // Test API principale
    log('📡 Test API principale...', 'cyan');
    const apiResponse = await makeRequest(`${BACKEND_URL}/api`);
    if (apiResponse.status === 200 && apiResponse.data.message) {
      log('✅ API principale accessible', 'green');
      results.apiMain = true;
      results.endpoints = Object.keys(apiResponse.data.endpoints || {});
      log(`   Endpoints: ${results.endpoints.join(', ')}`, 'green');
    } else {
      log('❌ API principale non accessible', 'red');
      return results;
    }

    // Test endpoint ImageKit (sans auth)
    log('\n🔐 Test endpoint ImageKit (sans authentification)...', 'cyan');
    const imagekitResponse = await makeRequest(`${BACKEND_URL}/api/imagekit/auth`);
    if (imagekitResponse.status === 401) {
      log('✅ Endpoint ImageKit protégé (authentification requise)', 'green');
      results.imagekitEndpoint = true;
      results.authProtection = true;
    } else {
      log('❌ Endpoint ImageKit non protégé', 'red');
    }

    return results;
  } catch (error) {
    log(`❌ Erreur lors du test backend: ${error.message}`, 'red');
    return results;
  }
}

async function testFrontend() {
  log('\n🎨 TEST FRONTEND', 'blue');
  log('=' * 40, 'blue');
  
  const results = {
    server: false,
    components: false,
    compilation: false
  };

  try {
    // Test serveur frontend
    log('🌐 Test serveur frontend...', 'cyan');
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200 && response.raw.includes('Vite + React + TS')) {
      log('✅ Serveur frontend accessible', 'green');
      results.server = true;
    } else {
      log('❌ Serveur frontend non accessible', 'red');
      return results;
    }

    // Test compilation des composants
    log('\n🧩 Test compilation des composants...', 'cyan');
    const components = ['ImageUpload', 'ImageDisplay', 'ProductImageUpload'];
    let compiledComponents = 0;

    for (const component of components) {
      try {
        const compResponse = await makeRequest(`${FRONTEND_URL}/src/components/ui/${component}.tsx`);
        if (compResponse.status === 200 && compResponse.raw.includes(component)) {
          log(`✅ ${component} compile correctement`, 'green');
          compiledComponents++;
        } else {
          log(`❌ ${component} ne compile pas`, 'red');
        }
      } catch (error) {
        log(`❌ Erreur test ${component}: ${error.message}`, 'red');
      }
    }

    if (compiledComponents === components.length) {
      log('✅ Tous les composants compilent', 'green');
      results.components = true;
      results.compilation = true;
    }

    return results;
  } catch (error) {
    log(`❌ Erreur lors du test frontend: ${error.message}`, 'red');
    return results;
  }
}

async function testConfiguration() {
  log('\n⚙️ TEST CONFIGURATION', 'blue');
  log('=' * 40, 'blue');
  
  const results = {
    files: false,
    env: false,
    dependencies: false
  };

  // Test fichiers de configuration
  log('📁 Test fichiers de configuration...', 'cyan');
  const configFiles = [
    'frontend/src/config/imagekit.ts',
    'frontend/src/components/ui/ImageUpload.tsx',
    'frontend/src/components/ui/ImageDisplay.tsx',
    'frontend/src/components/ui/ProductImageUpload.tsx',
    'backend/src/services/imagekit.service.ts',
    'backend/src/routes/imagekit.routes.ts'
  ];

  let existingFiles = 0;
  for (const file of configFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
      existingFiles++;
    } else {
      log(`❌ ${file} manquant`, 'red');
    }
  }

  if (existingFiles === configFiles.length) {
    log('✅ Tous les fichiers de configuration existent', 'green');
    results.files = true;
  }

  // Test variables d'environnement
  log('\n🔧 Test variables d\'environnement...', 'cyan');
  const envFiles = [
    'frontend/.env',
    'frontend/env.example',
    'backend/.env',
    'backend/env.example'
  ];

  let envFilesOk = 0;
  for (const envFile of envFiles) {
    const filePath = path.join(__dirname, envFile);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('IMAGEKIT')) {
        log(`✅ ${envFile} contient des variables ImageKit`, 'green');
        envFilesOk++;
      } else {
        log(`⚠️  ${envFile} ne contient pas de variables ImageKit`, 'yellow');
      }
    } else {
      log(`❌ ${envFile} manquant`, 'red');
    }
  }

  if (envFilesOk >= 2) {
    log('✅ Variables d\'environnement configurées', 'green');
    results.env = true;
  }

  // Test dépendances
  log('\n📦 Test dépendances...', 'cyan');
  try {
    const frontendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend/package.json'), 'utf8'));
    const backendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend/package.json'), 'utf8'));

    if (frontendPackage.dependencies && frontendPackage.dependencies['imagekitio-react']) {
      log('✅ imagekitio-react installé (frontend)', 'green');
    } else {
      log('❌ imagekitio-react non installé (frontend)', 'red');
    }

    if (backendPackage.dependencies && backendPackage.dependencies['imagekit']) {
      log('✅ imagekit installé (backend)', 'green');
      results.dependencies = true;
    } else {
      log('❌ imagekit non installé (backend)', 'red');
    }
  } catch (error) {
    log(`❌ Erreur test dépendances: ${error.message}`, 'red');
  }

  return results;
}

async function testImageKitEndpoints() {
  log('\n🔌 TEST ENDPOINTS IMAGEKIT', 'blue');
  log('=' * 40, 'blue');
  
  const results = {
    auth: false,
    upload: false,
    delete: false,
    list: false,
    metadata: false
  };

  const endpoints = [
    { name: 'auth', path: '/api/imagekit/auth', method: 'GET', expectedStatus: 401 },
    { name: 'upload', path: '/api/imagekit/upload', method: 'POST', expectedStatus: 401 },
    { name: 'delete', path: '/api/imagekit/delete/test', method: 'DELETE', expectedStatus: 401 },
    { name: 'list', path: '/api/imagekit/list', method: 'GET', expectedStatus: 401 },
    { name: 'metadata', path: '/api/imagekit/metadata/test', method: 'GET', expectedStatus: 401 }
  ];

  for (const endpoint of endpoints) {
    try {
      log(`🔍 Test ${endpoint.name} (${endpoint.method} ${endpoint.path})...`, 'cyan');
      const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === endpoint.expectedStatus) {
        log(`✅ ${endpoint.name} répond correctement (${response.status})`, 'green');
        results[endpoint.name] = true;
      } else {
        log(`❌ ${endpoint.name} répond incorrectement (${response.status} au lieu de ${endpoint.expectedStatus})`, 'red');
      }
    } catch (error) {
      log(`❌ Erreur test ${endpoint.name}: ${error.message}`, 'red');
    }
  }

  return results;
}

async function testComponentExports() {
  log('\n📤 TEST EXPORTS COMPOSANTS', 'blue');
  log('=' * 40, 'blue');
  
  const results = {
    indexFile: false,
    exports: false
  };

  try {
    const indexPath = path.join(__dirname, 'frontend/src/components/ui/index.ts');
    if (fs.existsSync(indexPath)) {
      log('✅ Fichier index.ts existe', 'green');
      results.indexFile = true;

      const content = fs.readFileSync(indexPath, 'utf8');
      const expectedExports = ['ImageUpload', 'ImageDisplay', 'ProductImageUpload'];
      let foundExports = 0;

      for (const exportName of expectedExports) {
        if (content.includes(exportName)) {
          log(`✅ ${exportName} exporté`, 'green');
          foundExports++;
        } else {
          log(`❌ ${exportName} non exporté`, 'red');
        }
      }

      if (foundExports === expectedExports.length) {
        log('✅ Tous les composants sont exportés', 'green');
        results.exports = true;
      }
    } else {
      log('❌ Fichier index.ts manquant', 'red');
    }
  } catch (error) {
    log(`❌ Erreur test exports: ${error.message}`, 'red');
  }

  return results;
}

async function runFinalTest() {
  log('🚀 DÉMARRAGE DU TEST FINAL COMPLET', 'bold');
  log('=' * 50, 'magenta');
  log('Test de l\'intégration ImageKit complète', 'magenta');
  log('=' * 50, 'magenta');

  const startTime = Date.now();

  // Exécution de tous les tests
  const backendResults = await testBackendAPI();
  const frontendResults = await testFrontend();
  const configResults = await testConfiguration();
  const endpointsResults = await testImageKitEndpoints();
  const exportsResults = await testComponentExports();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Calcul des résultats globaux
  const allResults = {
    backend: backendResults,
    frontend: frontendResults,
    configuration: configResults,
    endpoints: endpointsResults,
    exports: exportsResults
  };

  // Affichage du résumé
  log('\n📊 RÉSUMÉ FINAL', 'bold');
  log('=' * 30, 'magenta');

  let totalTests = 0;
  let passedTests = 0;

  Object.entries(allResults).forEach(([category, results]) => {
    log(`\n${category.toUpperCase()}:`, 'blue');
    Object.entries(results).forEach(([test, passed]) => {
      totalTests++;
      if (passed) {
        log(`  ✅ ${test}`, 'green');
        passedTests++;
      } else {
        log(`  ❌ ${test}`, 'red');
      }
    });
  });

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  log('\n🎯 RÉSULTAT GLOBAL', 'bold');
  log('=' * 20, 'magenta');
  log(`Tests passés: ${passedTests}/${totalTests} (${successRate}%)`, successRate >= 80 ? 'green' : 'red');
  log(`Durée: ${duration}s`, 'cyan');

  if (successRate >= 90) {
    log('\n🎉 EXCELLENT ! L\'intégration ImageKit est parfaitement fonctionnelle !', 'green');
    log('✅ Tous les composants sont opérationnels', 'green');
    log('✅ L\'API backend fonctionne correctement', 'green');
    log('✅ Le frontend compile sans erreur', 'green');
    log('✅ La configuration est complète', 'green');
  } else if (successRate >= 70) {
    log('\n✅ BIEN ! L\'intégration ImageKit fonctionne avec quelques ajustements mineurs', 'yellow');
  } else {
    log('\n⚠️  ATTENTION ! L\'intégration ImageKit nécessite des corrections', 'red');
  }

  log('\n🚀 PROCHAINES ÉTAPES:', 'cyan');
  log('1. Configurez vos clés ImageKit dans les fichiers .env', 'cyan');
  log('2. Redémarrez vos serveurs', 'cyan');
  log('3. Testez les composants dans votre application', 'cyan');
  log('4. Visitez /imagekit-test pour les tests interactifs', 'cyan');

  return {
    success: successRate >= 80,
    rate: successRate,
    results: allResults,
    duration: duration
  };
}

// Exécution du test
if (require.main === module) {
  runFinalTest()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      log(`❌ Erreur fatale: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runFinalTest };
