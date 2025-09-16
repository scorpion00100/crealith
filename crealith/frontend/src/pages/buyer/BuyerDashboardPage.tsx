import React, { useState } from 'react';
import {
    ShoppingBag,
    Heart,
    Download,
    Star,
    TrendingUp,
    Clock,
    DollarSign,
    Package,
    Eye,
    Plus
} from 'lucide-react';
import { Sidebar } from '@/components/marketplace/Sidebar';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { fetchCart, addToCartAsync, updateCartItemAsync, removeFromCartAsync } from '@/store/slices/cartSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '@/store/slices/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

// Stats basiques pour MVP
const mockStats = {
    totalPurchases: 0,
    totalSpent: 0,
    favoritesCount: 0,
    downloadsCount: 0,
    recentActivity: 0
};

const mockRecentPurchases = [
    {
        id: '1',
        title: 'Template PowerPoint Moderne',
        price: 15.99,
        image: '/placeholder-product.jpg',
        purchaseDate: '2025-01-08',
        downloads: 2,
        rating: 4.8
    }
];

const mockRecommendedProducts = [
    {
        id: '4',
        title: 'Template Figma UI Kit',
        price: 25.99,
        originalPrice: 35.99,
        image: '/placeholder-product.jpg',
        rating: 4.9,
        reviewCount: 156,
        downloads: 1200,
        isFeatured: true,
        discount: 28,
        category: { name: 'Templates' },
        seller: { firstName: 'Alex', lastName: 'Designer' },
        createdAt: '2025-01-10'
    }
];

export const BuyerDashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab] = useState<'overview'>('overview');
    const { user } = useAuth();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>(mockRecommendedProducts);

    // Store selectors
    const cart = useAppSelector((s) => s.cart);
    const favorites = useAppSelector((s) => s.favorites.items);

    const isInCart = (id: string) => cart.items.some((i) => i.product.id === id);

    // Charger le panier serveur
    React.useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleAddToCart = async (product: any) => {
        try {
            await dispatch(addToCartAsync({ productId: product.id, quantity: 1 })).unwrap();
            dispatch(addNotification({ type: 'success', message: 'Ajouté au panier', duration: 2000 }));
        } catch {
            dispatch(addNotification({ type: 'error', message: 'Erreur ajout au panier', duration: 3000 }));
        }
    };

    const handleDecreaseQty = async (id: string) => {
        const item = cart.items.find((p) => p.id === id);
        if (!item) return;
        const nextQty = item.quantity - 1;
        try {
            if (nextQty <= 0) {
                await dispatch(removeFromCartAsync(id)).unwrap();
                dispatch(addNotification({ type: 'info', message: 'Retiré du panier', duration: 2000 }));
            } else {
                await dispatch(updateCartItemAsync({ id, quantity: nextQty })).unwrap();
            }
        } catch {
            dispatch(addNotification({ type: 'error', message: 'Erreur mise à jour quantité', duration: 3000 }));
        }
    };

    const handleIncreaseQty = async (id: string) => {
        const item = cart.items.find((p) => p.id === id);
        if (!item) return;
        try {
            await dispatch(updateCartItemAsync({ id, quantity: item.quantity + 1 })).unwrap();
        } catch {
            dispatch(addNotification({ type: 'error', message: 'Erreur mise à jour quantité', duration: 3000 }));
        }
    };

    const handleRemoveFromCart = async (id: string) => {
        try {
            await dispatch(removeFromCartAsync(id)).unwrap();
            dispatch(addNotification({ type: 'info', message: 'Retiré du panier', duration: 2000 }));
        } catch {
            dispatch(addNotification({ type: 'error', message: 'Erreur suppression', duration: 3000 }));
        }
    };

    const cartTotal = cart.items.reduce((sum, i) => sum + parseFloat(i.product.price) * i.quantity, 0);

    const isFavorite = (id: string) => favorites.some((p) => p.id === id);
    const handleToggleFavorite = async (product: any) => {
        try {
            if (isFavorite(product.id)) {
                await dispatch(removeFavoriteAsync(product.id)).unwrap();
                dispatch(addNotification({ type: 'info', message: 'Retiré des favoris', duration: 2000 }));
            } else {
                await dispatch(addFavoriteAsync(product.id)).unwrap();
                dispatch(addNotification({ type: 'success', message: 'Ajouté aux favoris', duration: 2000 }));
            }
        } catch {
            dispatch(addNotification({ type: 'error', message: 'Erreur favoris', duration: 3000 }));
        }
    };

    const handleSearch = (query: string) => {
        setIsSearching(true);
        setSearchQuery(query);
        window.setTimeout(() => {
            const q = query.toLowerCase();
            const filtered = mockRecommendedProducts.filter(p => p.title.toLowerCase().includes(q));
            setResults(filtered);
            setIsSearching(false);
        }, 400);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ComponentType<{ className?: string }>;
        change?: string;
        trend?: 'up' | 'down' | 'neutral';
    }> = ({ title, value, icon: Icon, change, trend = 'neutral' }) => (
        <div className="bg-background-800 rounded-2xl border border-background-700 p-6 hover:border-primary-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                    <Icon className="w-6 h-6 text-primary-400" />
                </div>
                {change && (
                    <span className={cn(
                        'text-sm font-medium px-2 py-1 rounded-full',
                        trend === 'up' && 'text-success-400 bg-success-500/20',
                        trend === 'down' && 'text-error-400 bg-error-500/20',
                        trend === 'neutral' && 'text-text-400 bg-background-700'
                    )}>
                        {change}
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-text-100 mb-1">{value}</p>
                <p className="text-sm text-text-400">{title}</p>
            </div>
        </div>
    );

    const RecentPurchaseCard: React.FC<{ purchase: any }> = ({ purchase }) => (
        <div className="bg-background-800 rounded-xl border border-background-700 p-4 hover:border-primary-500/30 transition-all duration-300">
            <div className="flex gap-4">
                <div className="w-16 h-16 bg-background-700 rounded-lg flex-shrink-0">
                    <img
                        src={purchase.image}
                        alt={purchase.title}
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-100 truncate">{purchase.title}</h4>
                    <p className="text-sm text-text-400 mb-2">
                        Acheté le {new Date(purchase.purchaseDate).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-400">
                            {formatPrice(purchase.price)}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-text-400">
                                {purchase.downloads} téléchargement{purchase.downloads > 1 ? 's' : ''}
                            </span>
                            <button className="p-1 text-text-400 hover:text-primary-400 transition-colors">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-900">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                variant="buyer"
            />

            {/* Main Content */}
            <div className="lg:ml-80 lg:pl-0">
                {/* Header */}
                <header className="bg-background-800 border-b border-background-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                aria-controls="buyer-sidebar"
                                aria-expanded={sidebarOpen}
                                aria-label="Ouvrir le menu"
                                className="lg:hidden p-2 text-text-400 hover:text-text-200 hover:bg-background-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-text-100">
                                    Bonjour, {user?.firstName} ! 👋
                                </h1>
                                <p className="text-text-400">
                                    Voici un aperçu de votre activité sur Crealith
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/favorites')}
                                className="px-3 py-2 rounded-lg bg-background-700 text-text-200 hover:bg-background-600"
                            >
                                Favoris
                            </button>
                            <button
                                onClick={() => navigate('/cart')}
                                className="px-3 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
                            >
                                Panier
                            </button>
                            <SearchBar className="hidden md:block" onSearch={handleSearch} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 bg-background-800 p-1 rounded-2xl w-fit">
                        <button
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                                'bg-primary-500 text-white'
                            )}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Vue d'ensemble
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total des achats"
                                    value={mockStats.totalPurchases}
                                    icon={ShoppingBag}
                                    change=""
                                    trend="neutral"
                                />
                                <StatCard
                                    title="Montant dépensé"
                                    value={formatPrice(mockStats.totalSpent)}
                                    icon={DollarSign}
                                    change=""
                                    trend="neutral"
                                />
                                <StatCard
                                    title="Produits favoris"
                                    value={mockStats.favoritesCount}
                                    icon={Heart}
                                    change=""
                                    trend="neutral"
                                />
                                <StatCard
                                    title="Téléchargements"
                                    value={mockStats.downloadsCount}
                                    icon={Download}
                                    change=""
                                    trend="neutral"
                                />
                            </div>

                            {/* Recent Purchases */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-text-100">Achats récents</h2>
                                        <button onClick={() => navigate('/orders')} className="text-primary-400 hover:text-primary-300 font-medium">
                                            Voir mes commandes
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {mockRecentPurchases.map((purchase) => (
                                            <RecentPurchaseCard key={purchase.id} purchase={purchase} />
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div>
                                    <h2 className="text-xl font-bold text-text-100 mb-6">Actions rapides</h2>
                                    <div className="space-y-4">
                                        <button onClick={() => navigate('/favorites')} className="w-full p-4 bg-background-800 border border-background-700 rounded-xl hover:border-primary-500/30 transition-all duration-300 text-left group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary-500/20 rounded-lg group-hover:bg-primary-500/30 transition-colors">
                                                    <Heart className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-100">Voir mes favoris</p>
                                                    <p className="text-sm text-text-400">Produits sauvegardés</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button onClick={() => navigate('/orders')} className="w-full p-4 bg-background-800 border border-background-700 rounded-xl hover:border-primary-500/30 transition-all duration-300 text-left group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-secondary-500/20 rounded-lg group-hover:bg-secondary-500/30 transition-colors">
                                                    <Download className="w-5 h-5 text-secondary-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-100">Mes commandes</p>
                                                    <p className="text-sm text-text-400">Téléchargements après paiement</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Cart Summary */}
                            <div className="bg-background-800 border border-background-700 rounded-2xl p-4 mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-text-100">Panier</h3>
                                    <span className="text-sm text-text-400">{cart.items.length} article{cart.items.length > 1 ? 's' : ''}</span>
                                </div>
                                {cart.items.length === 0 ? (
                                    <p className="text-text-400">Votre panier est vide</p>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-text-100 truncate">{item.product.title}</p>
                                                    <p className="text-text-400 text-sm">{item.quantity} × {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(item.product.price))}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="px-2 py-1 bg-background-700 rounded" onClick={() => handleDecreaseQty(item.id)}>-</button>
                                                    <button className="px-2 py-1 bg-background-700 rounded" onClick={() => handleIncreaseQty(item.id)}>+</button>
                                                    <button className="px-2 py-1 bg-background-700 rounded" onClick={() => handleRemoveFromCart(item.id)}>Retirer</button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-3 mt-2 border-t border-background-700 flex items-center justify-between">
                                            <span className="text-text-400">Total</span>
                                            <span className="text-text-100 font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cartTotal)}</span>
                                        </div>
                                        <button className="w-full mt-3 px-4 py-2 rounded-xl bg-primary-500 text-white disabled:opacity-50" disabled={cart.items.length === 0} onClick={() => navigate('/checkout')}>
                                            Passer au paiement
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Recommended Products */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-text-100">Recommandés pour vous</h2>
                                    <button onClick={() => navigate('/catalog')} className="text-primary-400 hover:text-primary-300 font-medium">
                                        Voir plus
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-text-400">
                                        {isSearching ? 'Chargement des résultats…' : `Résultats (${results.length})`}
                                    </div>
                                    {searchQuery && !isSearching && (
                                        <div className="text-xs text-text-500">Requête: “{searchQuery}”</div>
                                    )}
                                </div>

                                {isSearching && (
                                    <div className="w-full py-10 text-center text-text-400">Chargement…</div>
                                )}

                                {!isSearching && results.length === 0 && (
                                    <div className="w-full py-10 text-center">
                                        <p className="text-text-300 mb-3">Aucun produit ne correspond à votre recherche</p>
                                        <button
                                            className="px-4 py-2 bg-background-700 hover:bg-background-600 rounded-lg text-text-200"
                                            onClick={() => { setResults(mockRecommendedProducts); setSearchQuery(''); }}
                                        >
                                            Réinitialiser la recherche
                                        </button>
                                    </div>
                                )}

                                {!isSearching && results.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                showSeller={true}
                                                onAddToCart={() => handleAddToCart(product)}
                                                isInCart={isInCart(product.id)}
                                                onAddToFavorites={() => handleToggleFavorite(product)}
                                                isFavorite={isFavorite(product.id)}
                                                onQuickView={(id) => navigate(`/product/${id}`)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sections non-implémentées retirées pour MVP */}
                </main>
            </div>
        </div>
    );
};
