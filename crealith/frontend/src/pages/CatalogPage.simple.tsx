import React, { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { SearchBar } from '@/components/ui/SearchBar.simple';
import { fetchProducts } from '@/store/slices/productSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCartAsync, fetchCart } from '@/store/slices/cartSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '@/store/slices/favoritesSlice';
import { addNotification } from '@/store/slices/uiSlice';
import {
    Grid3X3,
    List,
    Filter,
    Search,
    TrendingUp,
    Star,
    Download,
    Palette,
    Sparkles,
    Eye,
    ShoppingCart,
    Shield,
    RefreshCw
} from 'lucide-react';
import '../styles/pages/catalog.css';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CatalogPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'price_asc' | 'price_desc'>('popular');
    const { items: products, isLoading } = useAppSelector(state => state.products);
    const favorites = useAppSelector(s => s.favorites.items);
    const [previewProduct, setPreviewProduct] = useState<any | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Charger les produits
    useEffect(() => {
        dispatch(fetchProducts({}));
    }, [dispatch]);

    // Filtrer les produits (utilise le slug de catégorie)
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
                return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
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
        { id: 'all', name: 'Toutes les catégories', icon: Palette },
        { id: 'templates', name: 'Templates Web', icon: Grid3X3 },
        { id: 'ui-kits', name: 'UI Kits', icon: List },
        { id: 'dashboards', name: 'Dashboards', icon: TrendingUp },
        { id: 'illustrations', name: 'Illustrations', icon: Sparkles },
    ];

    const handleViewProduct = (productId: string) => {
        window.location.href = `/product/${productId}`;
    };

    const handleAddToCart = async (productId: string) => {
        if (!isAuthenticated) {
            dispatch(addNotification({ type: 'warning', message: 'Connectez-vous pour ajouter au panier', duration: 3000 }));
            navigate('/login?redirect=/catalog');
            return;
        }
        try {
            await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
            // Synchroniser le panier après l'ajout
            await dispatch(fetchCart()).unwrap();
            dispatch(addNotification({ type: 'success', message: 'Ajouté au panier', duration: 2000 }));
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur ajout au panier',
                duration: 3000
            }));
        }
    };

    const handleToggleFavorite = async (productId: string) => {
        if (!isAuthenticated) {
            dispatch(addNotification({ type: 'warning', message: 'Connectez-vous pour gérer vos favoris', duration: 3000 }));
            navigate('/login?redirect=/catalog');
            return;
        }
        try {
            const isFav = favorites.some(p => p.id === productId);
            if (isFav) {
                await dispatch(removeFavoriteAsync(productId)).unwrap();
                dispatch(addNotification({ type: 'info', message: 'Retiré des favoris', duration: 2000 }));
            } else {
                await dispatch(addFavoriteAsync(productId)).unwrap();
                dispatch(addNotification({ type: 'success', message: 'Ajouté aux favoris', duration: 2000 }));
            }
        } catch {
            dispatch(addNotification({ type: 'error', message: 'Erreur favoris', duration: 3000 }));
        }
    };

    const handlePreview = (product: any) => {
        setPreviewProduct(product);
        setIsPreviewOpen(true);
    };

    return (
        <div className="catalog-page">
            {/* Hero Section */}
            <section className="catalog-hero">
                <div className="catalog-hero-content">
                    <h1>Découvrez notre catalogue</h1>
                    <p>Trouvez les meilleurs templates, UI kits et ressources créatives pour vos projets</p>
                    {isAuthenticated && (
                        <div className="mt-4 flex gap-3">
                            <button onClick={() => navigate('/cart')} className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600">Voir mon panier</button>
                            <button onClick={() => navigate('/favorites')} className="px-4 py-2 rounded-lg bg-background-700 text-text-200 hover:bg-background-600">Mes favoris</button>
                        </div>
                    )}
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

                        {/* Price Range */}
                        <div className="price-filter">
                            <input
                                type="number"
                                inputMode="decimal"
                                placeholder="Min €"
                                className="price-input"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                            />
                            <span className="mx-2 text-text-400">–</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                placeholder="Max €"
                                className="price-input"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                            />
                        </div>

                        {/* Sort */}
                        <div className="sort-filter">
                            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                                <option value="popular">Populaire</option>
                                <option value="recent">Récent</option>
                                <option value="price_asc">Prix: croissant</option>
                                <option value="price_desc">Prix: décroissant</option>
                            </select>
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
                                products={sortedProducts}
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

            {/* Preview Modal */}
            {isPreviewOpen && previewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white border border-earth-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-earth-200 bg-earth-50">
                            <h3 className="text-xl font-semibold text-earth-900 truncate">{previewProduct.title}</h3>
                            <button
                                className="text-earth-400 hover:text-earth-600 p-2 hover:bg-earth-100 rounded-lg transition-colors"
                                onClick={() => setIsPreviewOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                            {/* Image */}
                            <div className="space-y-4">
                                <img
                                    src={previewProduct.thumbnailUrl || previewProduct.image}
                                    alt={previewProduct.title}
                                    className="w-full h-80 object-cover rounded-xl shadow-md"
                                />
                                {previewProduct.images && previewProduct.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {previewProduct.images.slice(0, 4).map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`${previewProduct.title} ${index + 1}`}
                                                className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="space-y-6">
                                {/* Price */}
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-primary-600">{previewProduct.price} €</span>
                                    {previewProduct.originalPrice && (
                                        <span className="text-lg text-earth-400 line-through">{previewProduct.originalPrice} €</span>
                                    )}
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400">★</span>
                                        ))}
                                    </div>
                                    <span className="text-sm text-earth-600">(4.8) • 127 avis</span>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="font-semibold text-earth-900 mb-2">Description</h4>
                                    <p className="text-earth-600 text-sm leading-relaxed line-clamp-6">
                                        {previewProduct.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <div>
                                    <h4 className="font-semibold text-earth-900 mb-2">Ce que vous recevez</h4>
                                    <ul className="text-sm text-earth-600 space-y-1">
                                        <li>• Fichier source complet</li>
                                        <li>• Documentation d'utilisation</li>
                                        <li>• Licence commerciale</li>
                                        <li>• Support par email</li>
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                        onClick={() => { setIsPreviewOpen(false); handleViewProduct(previewProduct.id); }}
                                    >
                                        <Eye className="w-4 h-4" />
                                        Voir la fiche complète
                                    </button>
                                    <button
                                        className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                                        onClick={() => handleAddToCart(previewProduct.id)}
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Ajouter au panier
                                    </button>
                                </div>

                                {/* Trust signals */}
                                <div className="bg-earth-50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-earth-600">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        <span>Paiement sécurisé</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-earth-600">
                                        <Download className="w-4 h-4 text-primary-500" />
                                        <span>Téléchargement immédiat</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-earth-600">
                                        <RefreshCw className="w-4 h-4 text-blue-500" />
                                        <span>Remboursement 30 jours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
