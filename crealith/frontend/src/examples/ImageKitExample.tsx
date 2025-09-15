import React, { useState } from 'react';
import { ProductImageUpload, ImageDisplay, AvatarImage } from '../components/ui';
import { ImageKitUploadResponse } from '../config/imagekit';

/**
 * Exemple d'utilisation des composants ImageKit
 * Ce fichier montre comment utiliser les différents composants ImageKit
 * dans votre application React.
 */
export const ImageKitExample: React.FC = () => {
    const [productImages, setProductImages] = useState<ImageKitUploadResponse[]>([]);
    const [avatarImage, setAvatarImage] = useState<ImageKitUploadResponse | null>(null);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Exemples d'utilisation ImageKit
            </h1>

            {/* Exemple 1: Upload d'images de produits */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">1. Upload d'images de produits</h2>
                <p className="text-gray-600 mb-4">
                    Composant complet pour gérer les images de produits avec prévisualisation,
                    réorganisation et gestion de l'image principale.
                </p>

                <ProductImageUpload
                    onImagesChange={setProductImages}
                    maxImages={5}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                />

                {/* Affichage des données des images uploadées */}
                {productImages.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Images uploadées :</h3>
                        <pre className="text-xs text-gray-600 overflow-auto">
                            {JSON.stringify(productImages, null, 2)}
                        </pre>
                    </div>
                )}
            </section>

            {/* Exemple 2: Affichage d'images optimisées */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">2. Affichage d'images optimisées</h2>
                <p className="text-gray-600 mb-4">
                    Différentes façons d'afficher des images avec optimisations automatiques.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Image de produit */}
                    <div>
                        <h3 className="font-medium mb-2">Image de produit</h3>
                        <ImageDisplay
                            src="https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg"
                            alt="Exemple de produit"
                            transformation="product"
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </div>

                    {/* Avatar */}
                    <div>
                        <h3 className="font-medium mb-2">Avatar</h3>
                        <AvatarImage
                            src="https://ik.imagekit.io/demo/tr:w-150,h-150/medium_cafe_B1iTdD0C.jpg"
                            alt="Avatar utilisateur"
                            size="lg"
                        />
                    </div>

                    {/* Image avec transformations personnalisées */}
                    <div>
                        <h3 className="font-medium mb-2">Transformations personnalisées</h3>
                        <ImageDisplay
                            src="https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg"
                            alt="Image avec transformations"
                            transformation={{
                                height: 200,
                                width: 200,
                                cropMode: 'maintain_ratio',
                                quality: 60,
                                format: 'webp',
                                blur: 5,
                            }}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Exemple 3: Upload d'avatar */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">3. Upload d'avatar</h2>
                <p className="text-gray-600 mb-4">
                    Upload simple d'une image d'avatar avec prévisualisation.
                </p>

                <div className="flex items-center space-x-6">
                    {/* Avatar actuel */}
                    <div>
                        {avatarImage ? (
                            <AvatarImage
                                src={avatarImage.url}
                                alt="Avatar utilisateur"
                                size="xl"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Bouton d'upload */}
                    <div>
                        <ProductImageUpload
                            onImagesChange={(images) => {
                                if (images.length > 0) {
                                    setAvatarImage(images[0]);
                                }
                            }}
                            maxImages={1}
                            className="w-64"
                        />
                    </div>
                </div>
            </section>

            {/* Exemple 4: Galerie d'images */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">4. Galerie d'images</h2>
                <p className="text-gray-600 mb-4">
                    Affichage d'une galerie d'images avec clic pour agrandir.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        'https://ik.imagekit.io/demo/tr:w-200,h-200/medium_cafe_B1iTdD0C.jpg',
                        'https://ik.imagekit.io/demo/tr:w-200,h-200/sample-image.jpg',
                        'https://ik.imagekit.io/demo/tr:w-200,h-200/medium_cafe_B1iTdD0C.jpg',
                        'https://ik.imagekit.io/demo/tr:w-200,h-200/sample-image.jpg',
                    ].map((src, index) => (
                        <div key={index} className="cursor-pointer group">
                            <ImageDisplay
                                src={src}
                                alt={`Image ${index + 1}`}
                                transformation="thumbnail"
                                className="w-full h-32 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                                onLoad={() => console.log(`Image ${index + 1} loaded`)}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Exemple 5: Images avec lazy loading */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">5. Images avec lazy loading</h2>
                <p className="text-gray-600 mb-4">
                    Images qui se chargent uniquement quand elles entrent dans le viewport.
                </p>

                <div className="space-y-4">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div key={index} className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageDisplay
                                src={`https://ik.imagekit.io/demo/tr:w-400,h-200/medium_cafe_B1iTdD0C.jpg?t=${index}`}
                                alt={`Image lazy ${index + 1}`}
                                loading="lazy"
                                className="w-full h-full object-cover rounded-lg"
                                placeholder="https://ik.imagekit.io/demo/tr:w-400,h-200,bl-10/medium_cafe_B1iTdD0C.jpg"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Instructions d'utilisation */}
            <section className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-900">Instructions d'utilisation</h2>
                <div className="text-blue-800 space-y-2">
                    <p><strong>1. Configuration :</strong> Assurez-vous d'avoir configuré vos variables d'environnement ImageKit.</p>
                    <p><strong>2. Authentification :</strong> Le backend doit être configuré pour générer les tokens d'authentification.</p>
                    <p><strong>3. Upload :</strong> Utilisez les composants d'upload pour permettre aux utilisateurs d'ajouter des images.</p>
                    <p><strong>4. Affichage :</strong> Utilisez les composants d'affichage pour optimiser automatiquement les images.</p>
                    <p><strong>5. Transformations :</strong> Personnalisez les transformations selon vos besoins.</p>
                </div>
            </section>
        </div>
    );
};

export default ImageKitExample;
