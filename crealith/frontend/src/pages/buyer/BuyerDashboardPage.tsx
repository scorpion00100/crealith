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
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { cn } from '@/utils/cn';

// Mock data for demonstration
const mockStats = {
    totalPurchases: 24,
    totalSpent: 189.50,
    favoritesCount: 12,
    downloadsCount: 18,
    recentActivity: 5
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
    },
    {
        id: '2',
        title: 'Pack d\'icônes vectorielles',
        price: 8.50,
        image: '/placeholder-product.jpg',
        purchaseDate: '2025-01-05',
        downloads: 1,
        rating: 4.9
    },
    {
        id: '3',
        title: 'Mockup iPhone 15 Pro',
        price: 12.00,
        image: '/placeholder-product.jpg',
        purchaseDate: '2025-01-03',
        downloads: 3,
        rating: 4.7
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
    },
    {
        id: '5',
        title: 'Pack de polices premium',
        price: 19.99,
        image: '/placeholder-product.jpg',
        rating: 4.8,
        reviewCount: 89,
        downloads: 890,
        category: { name: 'Polices' },
        seller: { firstName: 'Sarah', lastName: 'Typography' },
        createdAt: '2025-01-09'
    },
    {
        id: '6',
        title: 'Photoshop Actions Pro',
        price: 14.99,
        image: '/placeholder-product.jpg',
        rating: 4.7,
        reviewCount: 234,
        downloads: 2100,
        category: { name: 'Actions' },
        seller: { firstName: 'Mike', lastName: 'Photo' },
        createdAt: '2025-01-08'
    }
];

export const BuyerDashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'favorites' | 'downloads'>('overview');
    const { user, logout } = useAuth();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>(mockRecommendedProducts);

    // État panier simple (id + qty)
    const [cartItems, setCartItems] = useState<{ id: string; title: string; price: number; qty: number }[]>([]);

    const isInCart = (id: string) => cartItems.some((i) => i.id === id);

    const handleAddToCart = (product: any) => {
        setCartItems((prev) => {
            const existing = prev.find((p) => p.id === product.id);
            if (existing) {
                return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
            }
            return [...prev, { id: product.id, title: product.title, price: product.price, qty: 1 }];
        });
        dispatch(addNotification({ type: 'success', message: 'Ajouté au panier', duration: 2000 }));
    };

    const handleDecreaseQty = (id: string) => {
        setCartItems((prev) => {
            const item = prev.find((p) => p.id === id);
            if (!item) return prev;
            if (item.qty <= 1) return prev.filter((p) => p.id !== id);
            return prev.map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p));
        });
    };

    const handleRemoveFromCart = (id: string) => {
        setCartItems((prev) => prev.filter((p) => p.id !== id));
        dispatch(addNotification({ type: 'info', message: 'Retiré du panier', duration: 2000 }));
    };

    const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    const handleSearch = (query: string, filters?: any) => {
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
            <div className="lg:ml-80">
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

                        <div className="flex items-center gap-4">
                            <SearchBar className="hidden md:block" onSearch={handleSearch} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 bg-background-800 p-1 rounded-2xl w-fit">
                        {[
                            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
                            { id: 'purchases', label: 'Mes achats', icon: ShoppingBag },
                            { id: 'favorites', label: 'Favoris', icon: Heart },
                            { id: 'downloads', label: 'Téléchargements', icon: Download }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                                    activeTab === tab.id
                                        ? 'bg-primary-500 text-white'
                                        : 'text-text-400 hover:text-text-200 hover:bg-background-700'
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
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
                                    change="+3 ce mois"
                                    trend="up"
                                />
                                <StatCard
                                    title="Montant dépensé"
                                    value={formatPrice(mockStats.totalSpent)}
                                    icon={DollarSign}
                                    change="+12%"
                                    trend="up"
                                />
                                <StatCard
                                    title="Produits favoris"
                                    value={mockStats.favoritesCount}
                                    icon={Heart}
                                    change="+2 cette semaine"
                                    trend="up"
                                />
                                <StatCard
                                    title="Téléchargements"
                                    value={mockStats.downloadsCount}
                                    icon={Download}
                                    change="+5 récents"
                                    trend="up"
                                />
                            </div>

                            {/* Recent Purchases */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-text-100">Achats récents</h2>
                                        <button className="text-primary-400 hover:text-primary-300 font-medium">
                                            Voir tout
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
                                        <button className="w-full p-4 bg-background-800 border border-background-700 rounded-xl hover:border-primary-500/30 transition-all duration-300 text-left group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary-500/20 rounded-lg group-hover:bg-primary-500/30 transition-colors">
                                                    <Heart className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-100">Voir mes favoris</p>
                                                    <p className="text-sm text-text-400">12 produits sauvegardés</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button className="w-full p-4 bg-background-800 border border-background-700 rounded-xl hover:border-primary-500/30 transition-all duration-300 text-left group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-secondary-500/20 rounded-lg group-hover:bg-secondary-500/30 transition-colors">
                                                    <Download className="w-5 h-5 text-secondary-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-100">Téléchargements</p>
                                                    <p className="text-sm text-text-400">18 fichiers disponibles</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button className="w-full p-4 bg-background-800 border border-background-700 rounded-xl hover:border-primary-500/30 transition-all duration-300 text-left group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-success-500/20 rounded-lg group-hover:bg-success-500/30 transition-colors">
                                                    <Star className="w-5 h-5 text-success-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-100">Mes avis</p>
                                                    <p className="text-sm text-text-400">Laisser un avis</p>
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
                                    <span className="text-sm text-text-400">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</span>
                                </div>
                                {cartItems.length === 0 ? (
                                    <p className="text-text-400">Votre panier est vide</p>
                                ) : (
                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-text-100 truncate">{item.title}</p>
                                                    <p className="text-text-400 text-sm">{item.qty} × {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="px-2 py-1 bg-background-700 rounded" onClick={() => handleDecreaseQty(item.id)}>-</button>
                                                    <button className="px-2 py-1 bg-background-700 rounded" onClick={() => handleAddToCart(item)}>+</button>
                                                    <button className="px-2 py-1 bg-background-700 rounded" onClick={() => handleRemoveFromCart(item.id)}>Retirer</button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-3 mt-2 border-t border-background-700 flex items-center justify-between">
                                            <span className="text-text-400">Total</span>
                                            <span className="text-text-100 font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cartTotal)}</span>
                                        </div>
                                        <button className="w-full mt-3 px-4 py-2 rounded-xl bg-primary-500 text-white disabled:opacity-50" disabled={cartItems.length === 0}>
                                            Passer au paiement
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Recommended Products */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-text-100">Recommandés pour vous</h2>
                                    <button className="text-primary-400 hover:text-primary-300 font-medium">
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
                                                onAddToFavorites={(id) => console.log('Add to favorites:', id)}
                                                onQuickView={(id) => console.log('Quick view:', id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Other tabs content would go here */}
                    {activeTab !== 'overview' && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-background-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-12 h-12 text-text-400" />
                            </div>
                            <h3 className="text-xl font-bold text-text-100 mb-2">
                                {activeTab === 'purchases' && 'Mes achats'}
                                {activeTab === 'favorites' && 'Mes favoris'}
                                {activeTab === 'downloads' && 'Mes téléchargements'}
                            </h3>
                            <p className="text-text-400">
                                Cette section sera bientôt disponible
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
