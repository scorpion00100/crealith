import React from 'react';
import { Product } from '@/types';
import {
    Eye,
    Edit,
    Trash2,
    Download,
    Star,
    TrendingUp,
    Euro,
    Calendar,
    BarChart3,
    Heart,
    ShoppingCart,
    CheckCircle,
    Sparkles,
    Award
} from 'lucide-react';

interface ProductCardProps {
    product: Product;
    variant?: 'buyer' | 'seller' | 'admin' | 'minimal';
    size?: 'small' | 'medium' | 'large';
    onView?: (productId: string) => void;
    onEdit?: (productId: string) => void;
    onDelete?: (productId: string) => void;
    onToggleFeatured?: (productId: string) => void;
    onAddToCart?: (productId: string) => void;
    onAddToFavorites?: (productId: string) => void;
    onPreview?: (product: Product) => void;
    isInCart?: boolean;
    isFavorite?: boolean;
    showStats?: boolean;
    showActions?: boolean;
}

const getStatusClassesFromStatus = (status?: string) => {
    if (!status) return 'bg-slate-700 text-slate-300 border-slate-600';
    return status === 'active' || status === 'published'
        ? 'bg-success-500/20 text-success-300 border-success-500/30'
        : 'bg-warning-500/20 text-warning-300 border-warning-500/30';
};

const getStatusLabelFromStatus = (status?: string) => {
    if (!status) return 'Inconnu';
    return status === 'active' || status === 'published' ? 'Publié' : 'Brouillon';
};

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
        case 'small':
            return {
                container: 'rounded-lg',
                image: 'aspect-[4/3]',
                padding: 'p-3',
                title: 'text-sm font-medium',
                price: 'text-base',
                actions: 'gap-1'
            };
        case 'large':
            return {
                container: 'rounded-2xl',
                image: 'aspect-[4/3]',
                padding: 'p-6',
                title: 'text-xl font-semibold',
                price: 'text-2xl',
                actions: 'gap-3'
            };
        default: // medium
            return {
                container: 'rounded-xl',
                image: 'aspect-[4/3]',
                padding: 'p-4',
                title: 'text-lg font-semibold',
                price: 'text-xl',
                actions: 'gap-2'
            };
    }
};

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    variant = 'buyer',
    size = 'medium',
    onView,
    onEdit,
    onDelete,
    onToggleFeatured,
    onAddToCart,
    onAddToFavorites,
    onPreview,
    isInCart = false,
    isFavorite = false,
    showStats = false,
    showActions = true
}) => {
    const discount = product.originalPrice ?
        ((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100 : 0;

    const isMinimal = variant === 'minimal';
    const sizeClasses = getSizeClasses(size);

    // Classes de base adaptées au thème Etsy
    const baseClasses = `group relative overflow-hidden ${sizeClasses.container} bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`;
    const darkClasses = `group relative overflow-hidden ${sizeClasses.container} bg-dark-800 border border-slate-700 hover:border-slate-600 transition-all duration-500 hover:shadow-2xl hover:shadow-glow transform hover:-translate-y-2`;

    // Utiliser les classes sombres pour le thème actuel
    const containerClasses = darkClasses;

    return (
        <div
            className={containerClasses}
            onClick={() => onView?.(product.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onView?.(product.id);
                }
            }}
        >
            {/* Image Container */}
            <div className={`relative ${sizeClasses.image} overflow-hidden`}>
                <img
                    src={product.thumbnailUrl || product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Overlay gradient */}
                {!isMinimal && (
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Badges */}
                {!isMinimal && (
                    <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
                        {product.isFeatured && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-warning-500 to-warning-600 text-white text-xs font-bold rounded-full shadow-lg">
                                <Award className="w-3 h-3" />
                                <span>En vedette</span>
                            </div>
                        )}
                        {discount > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-error-500 to-error-600 text-white text-xs font-bold rounded-full shadow-lg">
                                <Sparkles className="w-3 h-3" />
                                <span>-{Math.round(discount)}%</span>
                            </div>
                        )}
                        {/* Status Badge for seller/admin */}
                        {(variant === 'seller' || variant === 'admin') && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusClassesFromStatus((product as any).status)}`}>
                                {getStatusLabelFromStatus((product as any).status)}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {showActions && !isMinimal && (
                    <div className={`absolute top-3 right-3 flex flex-col ${sizeClasses.actions} z-10 opacity-0 group-hover:opacity-100 transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
                        {variant === 'buyer' && (
                            <>
                                <button
                                    onClick={() => onAddToFavorites?.(product.id)}
                                    className={`p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${isFavorite
                                            ? 'bg-accent-600 text-white hover:bg-accent-700 shadow-neon-accent'
                                            : 'bg-dark-800/80 text-slate-300 hover:text-accent-400 hover:bg-dark-700/80 border border-slate-600/50'
                                        }`}
                                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                >
                                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={() => onView?.(product.id)}
                                    className="p-2 bg-dark-800/80 text-slate-300 hover:text-primary-400 hover:bg-dark-700/80 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                                    title="Voir le produit"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {variant === 'seller' && (
                            <>
                                <button
                                    onClick={() => onView?.(product.id)}
                                    className="p-2 bg-dark-800/80 text-slate-300 hover:text-primary-400 hover:bg-dark-700/80 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                                    title="Voir le produit"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onEdit?.(product.id)}
                                    className="p-2 bg-dark-800/80 text-slate-300 hover:text-warning-400 hover:bg-dark-700/80 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                                    title="Modifier le produit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete?.(product.id)}
                                    className="p-2 bg-dark-800/80 text-slate-300 hover:text-error-400 hover:bg-dark-700/80 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                                    title="Supprimer le produit"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {variant === 'admin' && (
                            <>
                                <button
                                    onClick={() => onToggleFeatured?.(product.id)}
                                    className={`p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${product.isFeatured
                                            ? 'bg-warning-500/80 text-white hover:bg-warning-600/80'
                                            : 'bg-dark-800/80 text-slate-300 hover:text-warning-400 hover:bg-dark-700/80 border border-slate-600/50'
                                        }`}
                                    title={product.isFeatured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                                >
                                    <TrendingUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onView?.(product.id)}
                                    className="p-2 bg-dark-800/80 text-slate-300 hover:text-primary-400 hover:bg-dark-700/80 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                                    title="Voir le produit"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={sizeClasses.padding}>
                {/* Category */}
                {product.category && !isMinimal && (
                    <div className="text-xs text-gray-400 mb-2">
                        {product.category.name}
                    </div>
                )}

                {/* Title */}
                <h3 className={`${sizeClasses.title} text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors`}>
                    {product.title}
                </h3>

                {/* Minimal: show rating and price only */}
                {isMinimal ? (
                    <>
                        <div className="flex items-center gap-2 mb-2">
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
                                {(product.rating ?? 0).toFixed(1)} ({product.reviewCount || product.totalReviews || 0})
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`${sizeClasses.price} font-bold text-white`}>
                                {product.price}€
                            </span>
                            {product.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                    {product.originalPrice}€
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
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
                                <span className={`${sizeClasses.price} font-bold text-white`}>
                                    {product.price}€
                                </span>
                                {product.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through">
                                        {product.originalPrice}€
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats for seller/admin */}
                        {showStats && (variant === 'seller' || variant === 'admin') && (
                            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                                <div className="text-center">
                                    <div className="text-gray-400">Vues</div>
                                    <div className="text-white font-semibold">{product.viewsCount || 0}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-400">Ventes</div>
                                    <div className="text-white font-semibold">{product.salesCount || 0}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-400">Téléchargements</div>
                                    <div className="text-white font-semibold">{product.downloadsCount || 0}</div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {showActions && variant === 'buyer' && (
                            <div className={`flex ${sizeClasses.actions}`} onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onAddToCart?.(product.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>Ajouter</span>
                                </button>
                                {onPreview && (
                                    <button
                                        onClick={() => onPreview(product)}
                                        className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
