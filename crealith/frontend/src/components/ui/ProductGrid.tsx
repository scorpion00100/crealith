import React, { useState } from 'react';
import { useAppSelector } from '@/store';
import { ProductCard } from './ProductCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  List, 
  Filter,
  ArrowUpDown,
  TrendingUp,
  Clock,
  Euro
} from 'lucide-react';

interface ProductGridProps {
  products?: any[];
  loading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products: propProducts,
  loading = false,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const storeProducts = useAppSelector(state => state.products.items);
  const products = propProducts || storeProducts;

  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Tri des produits
  const sortedProducts = React.useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'popular':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [products, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'price-low':
      case 'price-high':
        return <Euro className="h-4 w-4" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4" />;
      case 'newest':
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-slate-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Filter className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Aucun produit trouvé</h3>
        <p className="text-slate-600 font-medium">
          Essayez de modifier vos critères de recherche ou explorez nos catégories populaires.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contrôles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">Trier par :</span>
          </div>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2 bg-slate-100 border-0 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
          >
            <option value="newest">Plus récents</option>
            <option value="popular">Plus populaires</option>
            <option value="price-low">Prix croissant</option>
            <option value="price-high">Prix décroissant</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-slate-700">Affichage :</span>
          <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl p-1">
            <button
              type="button"
              className={`p-2 rounded-xl transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => onViewModeChange?.('grid')}
              title="Vue grille"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={`p-2 rounded-xl transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => onViewModeChange?.('list')}
              title="Vue liste"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grille de produits */}
      <div className={`${
        viewMode === 'list' 
          ? 'space-y-6' 
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
      }`}>
        {paginatedProducts.map((product) => (
          <div key={product.id} className={viewMode === 'list' ? 'w-full' : ''}>
            <ProductCard
              product={product}
              variant="buyer"
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 py-8">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-semibold">Précédent</span>
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`w-10 h-10 rounded-2xl font-semibold transition-all duration-300 ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="flex items-center space-x-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="font-semibold">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Info pagination */}
      {totalPages > 1 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-600 font-medium">
            Page {currentPage} sur {totalPages} • {products.length} produit{products.length > 1 ? 's' : ''} au total
          </p>
        </div>
      )}
    </div>
  );
};
