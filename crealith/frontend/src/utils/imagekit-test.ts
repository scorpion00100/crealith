// Script de test pour vérifier la configuration ImageKit
import { IMAGEKIT_CONFIG } from '../config/imagekit';

export const testImageKitConfig = () => {
  console.log('🧪 Test de la configuration ImageKit...');
  
  // Vérifier les variables d'environnement
  const urlEndpoint = IMAGEKIT_CONFIG.urlEndpoint;
  const publicKey = IMAGEKIT_CONFIG.publicKey;
  
  console.log('📋 Configuration actuelle :');
  console.log('  - URL Endpoint:', urlEndpoint);
  console.log('  - Public Key:', publicKey ? `${publicKey.substring(0, 10)}...` : 'Non configuré');
  
  // Vérifications
  const checks = {
    urlEndpoint: urlEndpoint && urlEndpoint !== 'https://ik.imagekit.io/your_endpoint',
    publicKey: publicKey && publicKey !== 'your_imagekit_public_key',
  };
  
  console.log('\n✅ Résultats des vérifications :');
  console.log('  - URL Endpoint configuré:', checks.urlEndpoint ? '✅' : '❌');
  console.log('  - Public Key configuré:', checks.publicKey ? '✅' : '❌');
  
  if (!checks.urlEndpoint) {
    console.log('\n⚠️  URL Endpoint non configuré !');
    console.log('   Ajoutez VITE_IMAGEKIT_URL_ENDPOINT dans votre fichier .env');
  }
  
  if (!checks.publicKey) {
    console.log('\n⚠️  Public Key non configuré !');
    console.log('   Ajoutez VITE_IMAGEKIT_PUBLIC_KEY dans votre fichier .env');
  }
  
  const allConfigured = checks.urlEndpoint && checks.publicKey;
  
  if (allConfigured) {
    console.log('\n🎉 Configuration ImageKit complète !');
    console.log('   Vous pouvez maintenant utiliser les composants ImageKit.');
  } else {
    console.log('\n❌ Configuration ImageKit incomplète !');
    console.log('   Veuillez configurer les variables manquantes.');
  }
  
  return allConfigured;
};

// Test de génération d'URL
export const testImageUrlGeneration = (imagePath: string) => {
  console.log('\n🔗 Test de génération d\'URL d\'image...');
  
  try {
    const { buildImageUrl, IMAGE_TRANSFORMATIONS } = require('../config/imagekit');
    
    // Test URL simple
    const simpleUrl = buildImageUrl(imagePath);
    console.log('  - URL simple:', simpleUrl);
    
    // Test URL avec transformation
    const transformedUrl = buildImageUrl(imagePath, IMAGE_TRANSFORMATIONS.thumbnail);
    console.log('  - URL avec transformation:', transformedUrl);
    
    console.log('✅ Génération d\'URL fonctionnelle !');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la génération d\'URL:', error);
    return false;
  }
};

// Test de connectivité API
export const testImageKitAPI = async () => {
  console.log('\n🌐 Test de connectivité API ImageKit...');
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/imagekit/auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API ImageKit accessible !');
      console.log('  - Token généré:', data.token ? '✅' : '❌');
      return true;
    } else {
      console.log('❌ API ImageKit non accessible:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connectivité:', error);
    return false;
  }
};

// Test complet
export const runImageKitTests = async () => {
  console.log('🚀 Démarrage des tests ImageKit...\n');
  
  const configTest = testImageKitConfig();
  const urlTest = testImageUrlGeneration('/test-image.jpg');
  const apiTest = await testImageKitAPI();
  
  console.log('\n📊 Résumé des tests :');
  console.log('  - Configuration:', configTest ? '✅' : '❌');
  console.log('  - Génération URL:', urlTest ? '✅' : '❌');
  console.log('  - API Backend:', apiTest ? '✅' : '❌');
  
  const allTestsPassed = configTest && urlTest && apiTest;
  
  if (allTestsPassed) {
    console.log('\n🎉 Tous les tests ImageKit sont passés !');
    console.log('   Votre intégration ImageKit est prête à l\'emploi.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué.');
    console.log('   Veuillez vérifier votre configuration.');
  }
  
  return allTestsPassed;
};

// Export pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).testImageKit = {
    config: testImageKitConfig,
    url: testImageUrlGeneration,
    api: testImageKitAPI,
    all: runImageKitTests,
  };
}
