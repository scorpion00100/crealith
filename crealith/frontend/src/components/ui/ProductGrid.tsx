import React from 'react';
import { ProductCard } from './ProductCard.simple';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
  onView?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onPreview?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  viewMode = 'grid',
  onView,
  onAddToCart,
  onToggleFavorite,
  onPreview
}) => {
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
          variant="buyer"
          onView={onView}
          onAddToCart={onAddToCart}
          onAddToFavorites={onToggleFavorite}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export default ProductGrid;