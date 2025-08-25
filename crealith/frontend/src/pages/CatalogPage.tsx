import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/ui/Sidebar';
import { ProductCard } from '@/components/ui/ProductCard';
import { fetchProducts, setFilters, searchProducts } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { Product } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';

export const CatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<string>('featured');

  // Sélecteurs Redux
  const {
    products,
    searchResults,
    isLoading,
    filters,
    categories
  } = useAppSelector(state => state.products);

  const { searchQuery } = useAppSelector(state => state.ui);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // État local
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Synchronisation avec les paramètres URL
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'featured';

    setSelectedCategory(category);
    setSortBy(sort);

    // Mettre à jour les filtres Redux
    dispatch(setFilters({ category: category !== 'all' ? category : undefined }));

    // Rechercher si terme présent
    if (search) {
      dispatch(searchProducts(search));
    }
  }, [searchParams, dispatch]);

  // Charger les produits au montage
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts(filters));
    }
  }, [dispatch, products.length, filters]);

  // Produits à afficher (recherche ou liste complète)
  const displayProducts = useMemo(() => {
    let productsToShow = searchQuery && searchResults.length > 0 ? searchResults : products;

    // Filtrer par catégorie si sélectionnée
    if (selectedCategory !== 'all') {
      productsToShow = productsToShow.filter(product =>
        product.category.slug === selectedCategory ||
        product.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // Tri
    const sortedProducts = [...productsToShow].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return (b.totalSales || 0) - (a.totalSales || 0);
        default: // featured
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });

    return sortedProducts;
  }, [products, searchResults, searchQuery, selectedCategory, sortBy]);

  // Handlers
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    setSearchParams(newParams);

    // Mettre à jour les filtres Redux
    dispatch(setFilters({ category: categoryId !== 'all' ? categoryId : undefined }));
  };

  const handleSortChange = (sortType: string) => {
    setSortBy(sortType);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortType);
    setSearchParams(newParams);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      dispatch(addToCart(product));
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

  const handleToggleFavorite = (productId: number | string) => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Connectez-vous pour ajouter aux favoris',
        duration: 4000
      }));
      return;
    }

    // TODO: Implémenter la logique des favoris
    dispatch(addNotification({
      type: 'info',
      message: 'Fonctionnalité favoris bientôt disponible',
      duration: 3000
    }));
  };

  const handlePreview = (product: Product) => {
    console.log('Aperçu:', product.title);
    // TODO: Navigation vers page de détail produit
  };

  // Catégories pour la sidebar
  const categoriesWithCount = [
    { id: 'all', name: 'Tous les produits', count: products.length, icon: '📂' },
    { id: 'templates-web', name: 'Templates Web', count: products.filter(p => p.category.slug === 'templates-web').length, icon: '🌐' },
    { id: 'dashboards', name: 'Dashboards', count: products.filter(p => p.category.slug === 'dashboards').length, icon: '📊' },
    { id: 'ui-kits', name: 'UI Kits', count: products.filter(p => p.category.slug === 'ui-kits').length, icon: '🎨' },
    { id: 'mobile', name: 'Mobile Apps', count: products.filter(p => p.tags.includes('mobile')).length, icon: '📱' },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="main-layout">
          <Sidebar
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categoriesWithCount}
          />

          <div className="main-content">
            {/* Header de la page */}
            <div className="catalog-header">
              <div className="catalog-title">
                <h1>Catalogue</h1>
                <p>
                  {searchQuery
                    ? `Résultats pour "${searchQuery}"`
                    : 'Découvrez les créations de notre communauté'
                  }
                </p>
              </div>

              {/* Filtres et tri */}
              <div className="catalog-toolbar">
                <div className="toolbar-left">
                  <span className="results-count">
                    {displayProducts.length} produit{displayProducts.length !== 1 ? 's' : ''} trouvé{displayProducts.length !== 1 ? 's' : ''}
                  </span>
                  {isLoading && (
                    <span className="loading-indicator">Chargement...</span>
                  )}
                </div>

                <div className="toolbar-right">
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="featured">En vedette</option>
                    <option value="popular">Les plus populaires</option>
                    <option value="newest">Les plus récents</option>
                    <option value="price-low">Prix croissant</option>
                    <option value="price-high">Prix décroissant</option>
                    <option value="rating">Mieux notés</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Résultats */}
            {displayProducts.length > 0 ? (
              <div className="products-grid">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={() => handleToggleFavorite(product.id)}
                    onPreview={handlePreview}
                    isFavorite={false} // TODO: Récupérer depuis slice favoris
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>Aucun produit trouvé</h3>
                <p>
                  {searchQuery
                    ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres mots-clés.`
                    : 'Essayez de modifier vos critères de recherche ou explorez d\'autres catégories.'
                  }
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchParams({});
                    dispatch(setFilters({}));
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Message de chargement */}
            {isLoading && products.length === 0 && (
              <div className="loading-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <div className="loading-spinner">Chargement des produits...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
