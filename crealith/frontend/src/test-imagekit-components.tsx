// Test simple des composants ImageKit
import React from 'react';
import { ImageUpload, ImageDisplay, ProductImageUpload } from './components/ui';

// Test de compilation des composants
export const TestImageKitComponents = () => {
    return (
        <div>
            {/* Test ImageUpload */}
            <ImageUpload
                onUploadSuccess={(response) => {
                    console.log('Upload réussi:', response);
                }}
                onUploadError={(error) => {
                    console.error('Erreur upload:', error);
                }}
                folder="/test"
                tags={['test']}
            />

            {/* Test ImageDisplay */}
            <ImageDisplay
                src="https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg"
                alt="Test image"
                transformation="thumbnail"
                className="w-32 h-32"
            />

            {/* Test ProductImageUpload */}
            <ProductImageUpload
                onImagesChange={(images) => {
                    console.log('Images changées:', images);
                }}
                maxImages={3}
            />
        </div>
    );
};

// Test des imports
export const testImports = () => {
    try {
        // Test des imports
        console.log('✅ ImageUpload importé:', typeof ImageUpload);
        console.log('✅ ImageDisplay importé:', typeof ImageDisplay);
        console.log('✅ ProductImageUpload importé:', typeof ProductImageUpload);

        return true;
    } catch (error) {
        console.error('❌ Erreur d\'import:', error);
        return false;
    }
};

// Test de la configuration
export const testConfiguration = () => {
    try {
        const config = require('./config/imagekit');
        console.log('✅ Configuration ImageKit:', config.IMAGEKIT_CONFIG);
        return true;
    } catch (error) {
        console.error('❌ Erreur de configuration:', error);
        return false;
    }
};

// Test des hooks
export const testHooks = () => {
    try {
        const hooks = require('./hooks/useImageUpload');
        console.log('✅ Hooks ImageKit:', Object.keys(hooks));
        return true;
    } catch (error) {
        console.error('❌ Erreur des hooks:', error);
        return false;
    }
};

// Test complet
export const runComponentTests = () => {
    console.log('🧪 Test des composants ImageKit...');

    const results = {
        imports: testImports(),
        configuration: testConfiguration(),
        hooks: testHooks()
    };

    console.log('📊 Résultats:', results);

    const allPassed = Object.values(results).every(result => result);

    if (allPassed) {
        console.log('🎉 Tous les tests de composants sont passés !');
    } else {
        console.log('⚠️  Certains tests de composants ont échoué.');
    }

    return allPassed;
};

// Export pour utilisation dans la console
if (typeof window !== 'undefined') {
    (window as any).testImageKitComponents = {
        run: runComponentTests,
        imports: testImports,
        config: testConfiguration,
        hooks: testHooks
    };
}
