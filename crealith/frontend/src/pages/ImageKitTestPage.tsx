import React, { useState, useEffect } from 'react';
import { ImageUpload, ImageDisplay, ProductImageUpload } from '../components/ui';
import { ImageKitUploadResponse } from '../config/imagekit';
import { testImageKitConfig, runImageKitTests } from '../utils/imagekit-test';

export const ImageKitTestPage: React.FC = () => {
    const [testResults, setTestResults] = useState<any>(null);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<ImageKitUploadResponse[]>([]);

    const runTests = async () => {
        setIsRunningTests(true);
        try {
            const results = await runImageKitTests();
            setTestResults(results);
        } catch (error) {
            console.error('Erreur lors des tests:', error);
            setTestResults(false);
        } finally {
            setIsRunningTests(false);
        }
    };

    useEffect(() => {
        // Lancer les tests automatiquement au chargement
        runTests();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🧪 Tests ImageKit
                    </h1>

                    <div className="mb-6">
                        <button
                            onClick={runTests}
                            disabled={isRunningTests}
                            className="btn btn-primary"
                        >
                            {isRunningTests ? 'Tests en cours...' : 'Relancer les tests'}
                        </button>
                    </div>

                    {testResults !== null && (
                        <div className={`p-4 rounded-lg ${testResults ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                            <h2 className={`font-semibold mb-2 ${testResults ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {testResults ? '✅ Tests réussis' : '❌ Tests échoués'}
                            </h2>
                            <p className={`text-sm ${testResults ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {testResults
                                    ? 'Votre configuration ImageKit est correcte et prête à l\'emploi.'
                                    : 'Veuillez vérifier votre configuration ImageKit dans les variables d\'environnement.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Test d'upload simple */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Test d'upload simple</h2>
                        <p className="text-gray-600 mb-4">
                            Testez l'upload d'une image simple avec ImageKit.
                        </p>

                        <ImageUpload
                            onUploadSuccess={(response) => {
                                console.log('Upload réussi:', response);
                                setUploadedImages(prev => [...prev, response]);
                            }}
                            onUploadError={(error) => {
                                console.error('Erreur upload:', error);
                            }}
                            folder="/crealith/test"
                            tags={['test', 'upload']}
                            maxFileSize={5 * 1024 * 1024}
                            buttonText="Tester l'upload"
                            className="mb-4"
                        />

                        {uploadedImages.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-medium mb-2">Images uploadées :</h3>
                                <div className="space-y-2">
                                    {uploadedImages.map((image, index) => (
                                        <div key={image.fileId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                            <ImageDisplay
                                                src={image.url}
                                                alt={`Test ${index + 1}`}
                                                transformation="thumbnail"
                                                className="w-12 h-12 rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {image.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(image.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Test d'upload de produits */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Test d'upload de produits</h2>
                        <p className="text-gray-600 mb-4">
                            Testez l'upload d'images de produits avec gestion complète.
                        </p>

                        <ProductImageUpload
                            onImagesChange={(images) => {
                                console.log('Images de produits:', images);
                            }}
                            maxImages={3}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                        />
                    </div>

                    {/* Test d'affichage d'images */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Test d'affichage d'images</h2>
                        <p className="text-gray-600 mb-4">
                            Testez l'affichage d'images avec différentes transformations.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Thumbnail</h3>
                                <ImageDisplay
                                    src="https://ik.imagekit.io/demo/tr:w-200,h-200/medium_cafe_B1iTdD0C.jpg"
                                    alt="Test thumbnail"
                                    transformation="thumbnail"
                                    className="w-full h-24 object-cover rounded"
                                />
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Medium</h3>
                                <ImageDisplay
                                    src="https://ik.imagekit.io/demo/tr:w-200,h-200/medium_cafe_B1iTdD0C.jpg"
                                    alt="Test medium"
                                    transformation="medium"
                                    className="w-full h-24 object-cover rounded"
                                />
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Product</h3>
                                <ImageDisplay
                                    src="https://ik.imagekit.io/demo/tr:w-200,h-200/medium_cafe_B1iTdD0C.jpg"
                                    alt="Test product"
                                    transformation="product"
                                    className="w-full h-24 object-cover rounded"
                                />
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Avatar</h3>
                                <ImageDisplay
                                    src="https://ik.imagekit.io/demo/tr:w-200,h-200/medium_cafe_B1iTdD0C.jpg"
                                    alt="Test avatar"
                                    transformation="avatar"
                                    className="w-full h-24 object-cover rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Informations de configuration */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Configuration actuelle</h2>
                        <p className="text-gray-600 mb-4">
                            Vérifiez votre configuration ImageKit.
                        </p>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">URL Endpoint:</span>
                                <span className="font-mono text-xs">
                                    {import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'Non configuré'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Public Key:</span>
                                <span className="font-mono text-xs">
                                    {import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY
                                        ? `${import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY.substring(0, 10)}...`
                                        : 'Non configuré'
                                    }
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">API URL:</span>
                                <span className="font-mono text-xs">
                                    {import.meta.env.VITE_API_URL || 'Non configuré'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">Instructions :</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Configurez vos variables d'environnement dans le fichier .env</li>
                                <li>• Redémarrez votre serveur de développement</li>
                                <li>• Vérifiez que votre backend est en cours d'exécution</li>
                                <li>• Testez les composants ci-dessus</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageKitTestPage;
