import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  variant?: 'buyer' | 'seller' | 'admin';
  onView?: (productId: string) => void;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onToggleFeatured?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onAddToFavorites?: (productId: string) => void;
  isInCart?: boolean;
  isFavorite?: boolean;
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

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'buyer',
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAddToCart,
  onAddToFavorites,
  isInCart = false,
  isFavorite = false
}) => {
  const discount = product.originalPrice ? ((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100 : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-dark-800 border border-slate-700 hover:border-slate-600 transition-all duration-500 hover:shadow-2xl hover:shadow-glow transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.thumbnailUrl || product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
          {product.isFeatured && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-warning-500 to-warning-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              <Award className="w-3 h-3" />
              <span>En vedette</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-error-500 to-error-600 text-white text-xs font-bold rounded-full shadow-lg">
              <Sparkles className="w-3 h-3" />
              <span>-{discount.toFixed(0)}%</span>
            </div>
          )}
          {/* Status Badge */}
          <div className={`absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusClassesFromStatus((product as any).status)}`}>
            {getStatusLabelFromStatus((product as any).status)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 z-10">
          {variant === 'buyer' && (
            <>
              <button
                onClick={() => onAddToFavorites?.(product.id)}
                className={`p-3 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-sm ${isFavorite
                  ? 'bg-accent-600 text-white hover:bg-accent-700 shadow-neon-accent'
                  : 'bg-dark-800/80 text-slate-300 hover:text-accent-400 hover:bg-dark-700/80 border border-slate-600/50'
                  }`}
                title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onView?.(product.id)}
                className="p-3 bg-dark-800/80 text-slate-300 hover:text-primary-400 hover:bg-dark-700/80 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                title="Voir le produit"
              >
                <Eye className="w-4 h-4" />
              </button>
            </>
          )}

          {variant === 'seller' && (
            <>
              <button
                onClick={() => onEdit?.(product.id)}
                className="p-3 bg-dark-800/80 text-slate-300 hover:text-primary-400 hover:bg-dark-700/80 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(product.id)}
                className="p-3 bg-dark-800/80 text-slate-300 hover:text-error-400 hover:bg-dark-700/80 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-sm border border-slate-600/50"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Category */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-100 text-lg line-clamp-2 mb-2 group-hover:text-primary-300 transition-colors duration-300">
            {product.title}
          </h3>
          <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            {product.category?.name || 'Catégorie inconnue'}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl font-black text-slate-100">€{parseFloat(product.price).toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-lg text-slate-500 line-through font-medium">€{parseFloat(product.originalPrice).toFixed(2)}</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-warning-400 fill-current" />
            <span className="font-bold text-slate-300">{(product.rating || 0).toFixed(1)}</span>
            <span>({product.reviewCount || (Array.isArray(product.reviews) ? product.reviews.length : 0)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-secondary-400" />
            <span className="font-bold text-slate-300">{product.downloadsCount || product.downloads || 0}</span>
          </div>
        </div>

        {/* Seller Stats (for seller variant) */}
        {variant === 'seller' && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-dark-700/50 rounded-xl border border-slate-600/50">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-success-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-black text-slate-200">{product.salesCount || product.totalSales || 0}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Ventes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-secondary-400 mb-1">
                <Euro className="w-4 h-4" />
                <span className="text-sm font-black text-slate-200">€{((product.salesCount || 0) * parseFloat(product.price)).toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Revenus</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {variant === 'buyer' && onAddToCart && (
          <button
            onClick={() => onAddToCart(product.id)}
            disabled={isInCart}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${isInCart
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'btn-primary'
              }`}
          >
            {isInCart ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Dans le panier</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Ajouter au panier</span>
              </>
            )}
          </button>
        )}

        {/* Date */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">Ajouté le {product.createdAt ? format(new Date(product.createdAt), 'dd MMM yyyy', { locale: fr }) : 'Date inconnue'}</span>
          </div>
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-500/30 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};
