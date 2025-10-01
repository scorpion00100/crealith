import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { fetchProducts } from '@/store/slices/productSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '@/store/slices/favoritesSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import {
  Grid3X3,
  List,
  Search,
  Sparkles,
  Zap,
  Palette,
  Code,
  Image as ImageIcon,
  LayoutDashboard,
  SlidersHorizontal,
  X
} from 'lucide-react';
import '../styles/pages/catalog.css';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'price_asc' | 'price_desc'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const { items: products, isLoading } = useAppSelector(state => state.products);
  const favorites = useAppSelector(s => s.favorites.items);

  // Charger les produits
  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Gestionnaires d'actions
  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Connectez-vous pour ajouter au panier',
        duration: 3000
      }));
      navigate('/login?redirect=/catalog');
      return;
    }

    try {
      await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
      await dispatch(fetchCart()).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Produit ajouté au panier',
        duration: 2000
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error?.message || 'Erreur lors de l\'ajout au panier',
        duration: 3000
      }));
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Connectez-vous pour gérer vos favoris',
        duration: 3000
      }));
      navigate('/login?redirect=/catalog');
      return;
    }

    try {
      const isFav = favorites.some(p => p.id === productId);
      if (isFav) {
        await dispatch(removeFavoriteAsync(productId)).unwrap();
        dispatch(addNotification({
          type: 'info',
          message: 'Retiré des favoris',
          duration: 2000
        }));
      } else {
        await dispatch(addFavoriteAsync(productId)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Ajouté aux favoris',
          duration: 2000
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Erreur favoris',
        duration: 3000
      }));
    }
  };

  const handlePreview = (product: any) => {
    // Ouvrir un modal de prévisualisation ou naviguer vers une page de preview
    // console.log('Preview product:', product);
  };

  // Filtrer et trier les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const productSlug = product.category?.slug || product.categoryId || '';
    const matchesCategory = selectedCategory === 'all' || productSlug === selectedCategory;

    const price = parseFloat(product.price || '0');
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    const matchesMin = min === undefined || price >= min;
    const matchesMax = max === undefined || price <= max;

    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price_asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price_desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'popular':
      default:
        return (b.downloadsCount || 0) - (a.downloadsCount || 0);
    }
  });

  const categories = [
    { id: 'all', name: 'Tout', slug: 'all', icon: Palette },
    { id: 'templates', name: 'Templates', slug: 'templates', icon: LayoutDashboard },
    { id: 'ui-kits', name: 'UI Kits', slug: 'ui-kits', icon: Sparkles },
    { id: 'dashboards', name: 'Dashboards', slug: 'dashboards', icon: Zap },
    { id: 'illustrations', name: 'Illustrations', slug: 'illustrations', icon: ImageIcon },
    { id: 'icons', name: 'Icons', slug: 'icons', icon: Sparkles },
    { id: 'code', name: 'Code', slug: 'code', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* En-tête avec titre et recherche */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Titre */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">Catalogue</h1>
            <p className="text-gray-400">Découvrez {products.length} produits digitaux créatifs</p>
          </div>

          {/* Barre de recherche */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des templates, UI kits, illustrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Catégories (Pills) */}
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.slug
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Bouton filtres avancés */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showFilters
                ? 'bg-primary-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </button>

            {/* Vue (grid/list) */}
            <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
                title="Vue grille"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
                title="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtres avancés (dépliables) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prix minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prix minimum</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00 €"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>

              {/* Prix maximum */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prix maximum</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="999.99 €"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-all"
                >
                  <option value="popular">Plus populaires</option>
                  <option value="recent">Plus récents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nombre de résultats */}
        <div className="mb-6">
          <p className="text-gray-400">
            <span className="text-white font-semibold">{sortedProducts.length}</span> produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
            {searchTerm && <span className="ml-2">pour "{searchTerm}"</span>}
          </p>
        </div>

        {/* Grille de produits */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg font-medium">Chargement des produits...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <Search className="w-16 h-16 text-gray-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche ou de filtrage
            </p>
            {(searchTerm || selectedCategory !== 'all' || minPrice || maxPrice) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <ProductGrid
            products={sortedProducts}
            viewMode={viewMode}
            onView={handleViewProduct}
            onToggleFavorite={handleToggleFavorite}
            cardVariant="minimal"
          />
        )}
      </div>
    </div>
  );
};
