import React, { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { ImageDisplay, ProductImage } from './ImageDisplay';
import { ImageKitUploadResponse } from '../../config/imagekit';

interface ProductImageUploadProps {
    onImagesChange: (images: ImageKitUploadResponse[]) => void;
    initialImages?: ImageKitUploadResponse[];
    maxImages?: number;
    className?: string;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
    onImagesChange,
    initialImages = [],
    maxImages = 5,
    className = '',
}) => {
    const [images, setImages] = useState<ImageKitUploadResponse[]>(initialImages);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

    const handleImageUpload = (response: ImageKitUploadResponse) => {
        const newImages = [...images, response];
        setImages(newImages);
        onImagesChange(newImages);

        // Si c'est la première image, la sélectionner automatiquement
        if (newImages.length === 1) {
            setSelectedImageIndex(0);
        }
    };

    const handleImageRemove = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);

        // Ajuster l'index sélectionné si nécessaire
        if (selectedImageIndex >= newImages.length) {
            setSelectedImageIndex(Math.max(0, newImages.length - 1));
        }
    };

    const handleImageReorder = (fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        setImages(newImages);
        onImagesChange(newImages);

        // Ajuster l'index sélectionné
        if (selectedImageIndex === fromIndex) {
            setSelectedImageIndex(toIndex);
        } else if (fromIndex < selectedImageIndex && toIndex >= selectedImageIndex) {
            setSelectedImageIndex(selectedImageIndex - 1);
        } else if (fromIndex > selectedImageIndex && toIndex <= selectedImageIndex) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    const canAddMoreImages = images.length < maxImages;

    return (
        <div className={`product-image-upload ${className}`}>
            {/* Image principale */}
            {images.length > 0 ? (
                <div className="mb-6">
                    <div className="relative">
                        <ProductImage
                            src={images[selectedImageIndex]?.url || ''}
                            alt="Image principale du produit"
                            variant="large"
                            className="w-full h-64 md:h-80"
                        />

                        {/* Indicateur d'image principale */}
                        <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Image principale
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6">
                    <div className="w-full h-64 md:h-80 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">Aucune image sélectionnée</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Miniatures des images */}
            {images.length > 1 && (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Images du produit</h3>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <div
                                key={image.fileId}
                                className={`relative flex-shrink-0 cursor-pointer group ${index === selectedImageIndex ? 'ring-2 ring-primary-500' : ''
                                    }`}
                                onClick={() => setSelectedImageIndex(index)}
                            >
                                <ProductImage
                                    src={image.url}
                                    alt={`Image ${index + 1}`}
                                    variant="thumbnail"
                                    className="w-16 h-16 rounded-lg"
                                />

                                {/* Bouton de suppression */}
                                <button
                                    type="button"
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageRemove(index);
                                    }}
                                >
                                    ×
                                </button>

                                {/* Indicateur d'image principale */}
                                {index === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary-500 text-white text-xs text-center py-0.5 rounded-b-lg">
                                        Principale
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Zone d'upload */}
            {canAddMoreImages && (
                <div className="mb-4">
                    <ImageUpload
                        onUploadSuccess={handleImageUpload}
                        onUploadError={(error) => {
                            // Upload error - handled by error state
                            // Vous pouvez ajouter une notification d'erreur ici
                        }}
                        folder="/crealith/products"
                        tags={['product', 'upload']}
                        maxFileSize={5 * 1024 * 1024} // 5MB
                        acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                        buttonText={`Ajouter une image ${images.length + 1}/${maxImages}`}
                        buttonClassName="btn-outline"
                        className="w-full"
                    />
                </div>
            )}

            {/* Informations sur les images */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>• Formats acceptés : JPEG, PNG, WebP</p>
                <p>• Taille maximale : 5MB par image</p>
                <p>• Maximum {maxImages} images par produit</p>
                <p>• La première image sera l'image principale</p>
            </div>

            {/* Boutons d'action */}
            {images.length > 0 && (
                <div className="mt-4 flex space-x-2">
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            // Réorganiser les images (mettre l'image sélectionnée en première position)
                            if (selectedImageIndex > 0) {
                                handleImageReorder(selectedImageIndex, 0);
                            }
                        }}
                        disabled={selectedImageIndex === 0}
                    >
                        Définir comme image principale
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer toutes les images ?')) {
                                setImages([]);
                                onImagesChange([]);
                                setSelectedImageIndex(0);
                            }
                        }}
                    >
                        Supprimer toutes les images
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductImageUpload;
