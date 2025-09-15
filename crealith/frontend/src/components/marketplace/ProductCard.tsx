import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Download, User } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/utils/cn';

interface ProductCardProps {
    product: Product;
    variant?: 'default' | 'compact' | 'featured';
    showSeller?: boolean;
    onAddToCart?: (productId: string) => void;
    onAddToFavorites?: (productId: string) => void;
    onQuickView?: (productId: string) => void;
    isInCart?: boolean;
    isFavorite?: boolean;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    variant = 'default',
    showSeller = false,
    onAddToCart,
    onAddToFavorites,
    onQuickView,
    isInCart = false,
    isFavorite = false,
    className,
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={cn(
                    'w-3 h-3',
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
                )}
            />
        ));
    };

    const cardVariants = {
        default: 'group relative bg-background-800 rounded-2xl border border-background-700 overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-premium hover:-translate-y-1',
        compact: 'group relative bg-background-800 rounded-xl border border-background-700 overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-medium',
        featured: 'group relative bg-gradient-to-br from-background-800 to-background-900 rounded-2xl border border-primary-500/30 overflow-hidden hover:border-primary-500/60 transition-all duration-300 hover:shadow-premium hover:-translate-y-2'
    };

    const imageVariants = {
        default: 'aspect-square',
        compact: 'aspect-[4/3]',
        featured: 'aspect-square'
    };

    return (
        <div className={cn(cardVariants[variant], className)}>
            {/* Image Container */}
            <div className={cn('relative overflow-hidden bg-background-900', imageVariants[variant])}>
                {/* Product Image */}
                <div className="relative w-full h-full">
                    {!imageError ? (
                        <img
                            src={product.images?.[0] || '/placeholder-product.jpg'}
                            alt={product.title}
                            loading="lazy"
                            className={cn(
                                'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-primary-500/30 rounded-lg flex items-center justify-center">
                                    <Download className="w-6 h-6 text-primary-400" />
                                </div>
                                <p className="text-xs text-text-400">Image non disponible</p>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-background-900 animate-pulse">
                            <div className="w-full h-full bg-gradient-to-br from-background-700 to-background-800" />
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                            {onQuickView && (
                                <button
                                    onClick={() => onQuickView(product.id)}
                                    className="p-2 min-h-[44px] min-w-[44px] bg-white/90 hover:bg-white text-background-900 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    title="Aperçu rapide"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            )}
                            {onAddToFavorites && (
                                <button
                                    onClick={() => onAddToFavorites(product.id)}
                                    className={cn(
                                        'p-2 min-h-[44px] min-w-[44px] rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500',
                                        isFavorite
                                            ? 'bg-secondary-500 text-white'
                                            : 'bg-white/90 hover:bg-white text-background-900'
                                    )}
                                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                >
                                    <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.isFeatured && (
                            <span className="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                                Vedette
                            </span>
                        )}
                        {product.discount && (
                            <span className="px-2 py-1 bg-secondary-500 text-white text-xs font-medium rounded-full">
                                -{product.discount}%
                            </span>
                        )}
                    </div>

                    {/* Cart Button */}
                    {onAddToCart && (
                        <div className="absolute top-3 right-3">
                            <button
                                onClick={() => onAddToCart(product.id)}
                                className={cn(
                                    'p-2 min-h-[44px] min-w-[44px] rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500',
                                    isInCart
                                        ? 'bg-success-500 text-white'
                                        : 'bg-white/90 hover:bg-white text-background-900'
                                )}
                                title={isInCart ? 'Dans le panier' : 'Ajouter au panier'}
                            >
                                <ShoppingCart className={cn('w-4 h-4', isInCart && 'fill-current')} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Seller Info */}
                {showSeller && product.seller && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-primary-500/20 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-primary-400" />
                        </div>
                        <span className="text-xs text-text-400 truncate">
                            {product.seller.firstName} {product.seller.lastName}
                        </span>
                    </div>
                )}

                {/* Title */}
                <Link
                    to={`/product/${product.id}`}
                    className="block mb-2 group-hover:text-primary-400 transition-colors duration-200"
                >
                    <h3 className={cn(
                        'font-medium text-text-100 line-clamp-2',
                        variant === 'compact' ? 'text-sm' : 'text-base',
                        variant === 'featured' && 'text-lg'
                    )}>
                        {product.title}
                    </h3>
                </Link>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                            {renderStars(product.rating)}
                        </div>
                        <span className="text-xs text-text-400">
                            ({product.reviewCount || 0})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            'font-bold text-text-100',
                            variant === 'compact' ? 'text-sm' : 'text-lg',
                            variant === 'featured' && 'text-xl'
                        )}>
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-text-400 line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Category Badge */}
                    {product.category && (
                        <span className="px-2 py-1 bg-background-700 text-text-400 text-xs rounded-full">
                            {product.category.name}
                        </span>
                    )}
                </div>

                {/* Additional Info */}
                {variant === 'default' && (
                    <div className="mt-3 pt-3 border-t border-background-700">
                        <div className="flex items-center justify-between text-xs text-text-400">
                            <span>{product.downloads || 0} téléchargements</span>
                            <span>{product.createdAt ? new Date(product.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
