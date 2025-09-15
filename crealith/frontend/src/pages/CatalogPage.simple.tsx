import React, { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { SearchBar } from '@/components/ui/SearchBar.simple';
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

    const handleViewProduct = (productId: string) => {
        console.log('View product:', productId);
        // Navigation vers la page de détail du produit
    };

    const handleAddToCart = (productId: string) => {
        console.log('Add to cart:', productId);
        // Logique d'ajout au panier
    };

    const handleToggleFavorite = (productId: string) => {
        console.log('Toggle favorite:', productId);
        // Logique de gestion des favoris
    };

    const handlePreview = (product: any) => {
        console.log('Preview product:', product);
        // Logique de prévisualisation
    };

    return (
        <div className="catalog-page">
            {/* Hero Section */}
            <section className="catalog-hero">
                <div className="catalog-hero-content">
                    <h1>Découvrez notre catalogue</h1>
                    <p>Trouvez les meilleurs templates, UI kits et ressources créatives pour vos projets</p>
                </div>
            </section>

            {/* Filters Section */}
            <section className="catalog-filters">
                <div className="container mx-auto px-4">
                    <div className="filter-section">
                        {/* Search Bar */}
                        <SearchBar
                            placeholder="Rechercher des produits..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                            className="flex-1 max-w-md"
                        />

                        {/* Category Filter */}
                        <div className="category-filter">
                            {categories.map((category) => {
                                const IconComponent = category.icon;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                    >
                                        <IconComponent className="w-4 h-4 mr-2" />
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* View Toggle */}
                        <div className="view-toggle">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                title="Vue grille"
                            >
                                <Grid3X3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                title="Vue liste"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="catalog-content">
                <div className="container mx-auto px-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg">Chargement des produits...</div>
                        </div>
                    ) : (
                        <>
                            {/* Results count */}
                            <div className="mb-6">
                                <p className="text-gray-400">
                                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Products Grid */}
                            <ProductGrid
                                products={filteredProducts}
                                viewMode={viewMode}
                                onView={handleViewProduct}
                                onAddToCart={handleAddToCart}
                                onToggleFavorite={handleToggleFavorite}
                                onPreview={handlePreview}
                            />
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CatalogPage;
