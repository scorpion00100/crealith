import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ui/ProductCard';
import { Sidebar } from '@/components/ui/Sidebar';
import { fetchProducts, setFilters, clearFilters } from '@/store/slices/productSlice';
import { addToCartAsync } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { Product, ProductFilters } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';

export const CatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { products, isLoading, pagination, filters } = useAppSelector(state => state.products);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Récupérer les filtres depuis l'URL
  useEffect(() => {
    const urlFilters: ProductFilters = {};
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy');

    if (category) urlFilters.category = category;
    if (search) urlFilters.search = search;
    if (minPrice) urlFilters.priceRange = { ...urlFilters.priceRange, min: parseFloat(minPrice) };
    if (maxPrice) urlFilters.priceRange = { ...urlFilters.priceRange, max: parseFloat(maxPrice) };
    if (sortBy) urlFilters.sortBy = sortBy;

    dispatch(setFilters(urlFilters));
  }, [searchParams, dispatch]);

  // Charger les produits
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Connectez-vous pour ajouter au panier',
        duration: 4000
      }));
      return;
    }

    try {
      await dispatch(addToCartAsync({ productId: product.id, quantity: 1 })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `${product.title} ajouté au panier`,
        duration: 3000
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Erreur lors de l\'ajout au panier',
        duration: 4000
      }));
    }
  };

  const handleFilterChange = (newFilters: ProductFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    dispatch(setFilters(updatedFilters));

    // Mettre à jour l'URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'priceRange') {
          if (value.min) params.set('minPrice', value.min.toString());
          if (value.max) params.set('maxPrice', value.max.toString());
        } else {
          params.set(key, value.toString());
        }
      }
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    handleFilterChange({ ...filters, page });
  };

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Header du catalogue */}
        <div className="catalog-header">
          <div className="catalog-title">
            <h1>Catalogue de produits</h1>
            <p>{pagination.total} produits disponibles</p>
          </div>

          <div className="catalog-controls">
            <button
              className="btn btn-outline"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              Filtres
            </button>

            <div className="view-mode-toggle">
              <button
                className={`btn btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                📱
              </button>
              <button
                className={`btn btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="catalog-content">
          {/* Sidebar des filtres */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Liste des produits */}
          <div className="products-section">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner">Chargement...</div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={() => { }}
                      onPreview={() => { }}
                      isFavorite={false}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-outline"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Précédent
                    </button>

                    <div className="page-numbers">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`btn btn-page ${page === pagination.page ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      className="btn btn-outline"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-products">
                <h3>Aucun produit trouvé</h3>
                <p>Essayez de modifier vos filtres ou de rechercher autre chose.</p>
                <button className="btn btn-primary" onClick={handleClearFilters}>
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
