import React, { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { fetchProducts } from '@/store/slices/productSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  Grid3X3,
  List,
  Filter,
  Search,
  TrendingUp,
  Star,
  Download,
  Palette,
  Sparkles
} from 'lucide-react';
import '../styles/pages/catalog.css';

export const CatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { items: products, isLoading } = useAppSelector(state => state.products);

  // Charger les produits
  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'Toutes les catégories', icon: Palette },
    { id: 'templates', name: 'Templates Web', icon: Grid3X3 },
    { id: 'ui-kits', name: 'UI Kits', icon: List },
    { id: 'dashboards', name: 'Dashboards', icon: TrendingUp },
    { id: 'illustrations', name: 'Illustrations', icon: Sparkles },
  ];

  return (
    <div className="catalog-page">
      {/* Hero Section */}
      <section className="catalog-hero">
        <div className="catalog-hero-content">
          <div className="flex items-center justify-center mb-6">
            <Palette className="h-10 w-10 mr-3 text-primary-400" />
            <h1 className="catalog-title">
              Catalogue Créatif
            </h1>
          </div>
          <p className="catalog-subtitle">
            Découvrez des milliers de produits digitaux créés par des artistes talentueux du monde entier
          </p>

          {/* Search Bar */}
          <div className="catalog-search">
            <Search className="catalog-search-icon" />
            <input
              type="text"
              placeholder="Rechercher des designs, templates, illustrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="catalog-stats">
            <div className="catalog-stat">
              <div className="catalog-stat-content">
                <div className="catalog-stat-icon">
                  <Download className="h-6 w-6" />
                </div>
                <div className="catalog-stat-value">{products.length}</div>
                <div className="catalog-stat-label">Produits disponibles</div>
              </div>
            </div>
            <div className="catalog-stat">
              <div className="catalog-stat-content">
                <div className="catalog-stat-icon">
                  <Star className="h-6 w-6" />
                </div>
                <div className="catalog-stat-value">50+</div>
                <div className="catalog-stat-label">Catégories</div>
              </div>
            </div>
            <div className="catalog-stat">
              <div className="catalog-stat-content">
                <div className="catalog-stat-icon">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="catalog-stat-value">1000+</div>
                <div className="catalog-stat-label">Vendeurs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="catalog-controls">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Category Filters */}
            <div className="catalog-filters">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
                  >
                    <Icon className="category-filter-icon" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
                title="Vue grille"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                title="Vue liste"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
              <p className="text-gray-400 text-lg font-medium">Chargement des produits...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="catalog-empty">
              <div className="catalog-empty-icon">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="catalog-empty-title">Aucun produit trouvé</h3>
              <p className="catalog-empty-message">
                Essayez de modifier vos critères de recherche ou de changer de catégorie
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-100 mb-2">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </h2>
                {searchTerm && (
                  <p className="text-gray-400 font-medium">
                    Résultats pour "{searchTerm}"
                  </p>
                )}
              </div>

              <ProductGrid
                products={filteredProducts}
                viewMode={viewMode}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
};
