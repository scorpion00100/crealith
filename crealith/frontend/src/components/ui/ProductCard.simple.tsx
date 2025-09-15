import React from 'react';
import { Product } from '@/types';
import {
    Eye,
    Star,
    Heart,
    ShoppingCart,
    Sparkles
} from 'lucide-react';

interface ProductCardProps {
    product: Product;
    variant?: 'buyer' | 'seller' | 'admin';
    onView?: (productId: string) => void;
    onAddToCart?: (productId: string) => void;
    onAddToFavorites?: (productId: string) => void;
    onPreview?: (product: Product) => void;
    isInCart?: boolean;
    isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    variant = 'buyer',
    onView,
    onAddToCart,
    onAddToFavorites,
    onPreview,
    isInCart = false,
    isFavorite = false
}) => {
    const discount = product.originalPrice ?
        ((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100 : 0;

    return (
        <div className="group relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={product.thumbnailUrl || product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
                    {product.isFeatured && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                            <Sparkles className="w-3 h-3" />
                            <span>En vedette</span>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            -{Math.round(discount)}%
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={() => onView?.(product.id)}
                        className="p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors"
                        title="Voir le produit"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onAddToFavorites?.(product.id)}
                        className={`p-2 rounded-full transition-colors ${isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                            }`}
                        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <div className="text-xs text-gray-400 mb-2">
                        {product.category.name}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {product.title}
                </h3>

                {/* Description */}
                {product.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {product.description}
                    </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-400">
                        {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">
                            {product.price}€
                        </span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {product.originalPrice}€
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onAddToCart?.(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Ajouter</span>
                    </button>
                    <button
                        onClick={() => onPreview?.(product)}
                        className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
