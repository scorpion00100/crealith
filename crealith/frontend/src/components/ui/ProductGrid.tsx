import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addFavoriteAsync, removeFavoriteAsync } from '@/store/slices/favoritesSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useCallback } from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
  onView?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onPreview?: (product: Product) => void;
  cardVariant?: 'minimal' | 'buyer' | 'seller' | 'admin';
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  viewMode = 'grid',
  onView,
  onAddToCart,
  onToggleFavorite,
  onPreview
}) => {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) => (state as any).favorites?.favoriteIds || []);

  const handleToggleFavorite = useCallback(async (productId: string) => {
    try {
      if (favoriteIds.includes(productId)) {
        await dispatch(removeFavoriteAsync(productId)).unwrap();
        dispatch(addNotification({ type: 'info', message: 'Retiré des favoris', duration: 2000 }));
      } else {
        await dispatch(addFavoriteAsync(productId)).unwrap();
        dispatch(addNotification({ type: 'success', message: 'Ajouté aux favoris', duration: 2000 }));
      }
    } catch (e: any) {
      dispatch(addNotification({ type: 'error', message: e?.message || 'Action favoris impossible', duration: 3000 }));
    }
  }, [dispatch, favoriteIds]);
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">Aucun produit trouvé</div>
        <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  const gridClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-4';

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="minimal"
          onView={onView}
          onAddToCart={onAddToCart}
          onAddToFavorites={onToggleFavorite || handleToggleFavorite}
          isFavorite={favoriteIds.includes(product.id)}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export default ProductGrid;