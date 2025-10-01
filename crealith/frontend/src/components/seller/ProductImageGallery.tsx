import React from 'react';
import { Product } from '@/types';

interface ProductImageGalleryProps {
    product: Product;
    selectedImage: number;
    onImageSelect: (index: number) => void;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
    product,
    selectedImage,
    onImageSelect
}) => {
    const images = [
        product.thumbnailUrl || product.image,
        ...(product.images || [])
    ].filter(Boolean);

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            {/* Image principale */}
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                <img
                    src={images[selectedImage] || 'https://via.placeholder.com/800x600?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => onImageSelect(index)}
                            className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                    ? 'border-blue-500 scale-105'
                                    : 'border-gray-700 hover:border-gray-600'
                                }`}
                        >
                            <img
                                src={img || 'https://via.placeholder.com/200x150?text=No+Image'}
                                alt={`${product.title} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

