import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Heart,
    Download,
    Star,
    DollarSign,
    Search,
    ArrowRight,
    FileText,
    MessageSquare
} from 'lucide-react';
import { Sidebar } from '@/components/marketplace/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { fetchCart, addToCartAsync } from '@/store/slices/cartSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '@/store/slices/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { fetchProducts } from '@/store/slices/productSlice';
import { ProductGrid } from '@/components/ui/ProductGrid';

// Données mock pour le MVP
const mockStats = {
    totalPurchases: 0,
    totalSpent: 0,
    favoritesCount: 0,
    downloadsCount: 0,
    recentActivity: 0
};

const mockRecentPurchases: any[] = [];

// Produits recommandés façon Etsy Digital
const mockRecommendedProducts = [
    {
        id: '4',
        title: 'Template Figma UI Kit',
        price: 25.99,
        originalPrice: 35.99,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFQzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSIzMCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpZ21hPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VSSBLaXQ8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI3MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRlc2lnbjwvdGV4dD48L3N2Zz4=',
        rating: 4.9,
        reviews: 127,
        category: 'Design',
        seller: 'DesignStudio'
    },
    {
        id: '5',
        title: 'Pack Icônes Minimalistes',
        price: 12.99,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFQzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSIzMCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkljw7RuZXM8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1pbmltYWxpc3RlczwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjcwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGFjazwvdGV4dD48L3N2Zz4=',
        rating: 4.7,
        reviews: 89,
        category: 'Design',
        seller: 'IconMaster'
    },
    {
        id: '6',
        title: 'Template Canva Business',
        price: 18.99,
        originalPrice: 24.99,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFQzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSIzMCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNhbnZhPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CdXNpbmVzczwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjcwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVtcGxhdGU8L3RleHQ+PC9zdmc+',
        rating: 4.8,
        reviews: 156,
        category: 'Marketing',
        seller: 'BusinessPro'
    },
    {
        id: '7',
        title: 'Mockup iPhone Premium',
        price: 22.99,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFQzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSIzMCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmlQaG9uZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TW9ja3VwPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNzAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QcmVtaXVtPC90ZXh0Pjwvc3ZnPg==',
        rating: 4.9,
        reviews: 203,
        category: 'Design',
        seller: 'MockupKing'
    },
    {
        id: '8',
        title: 'Template PowerPoint Executive',
        price: 29.99,
        originalPrice: 39.99,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFQzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSIzMCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkV4ZWN1dGl2ZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UG93ZXJQb2ludDwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjcwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVtcGxhdGU8L3RleHQ+PC9zdmc+',
        rating: 4.6,
        reviews: 78,
        category: 'Business',
        seller: 'ExecutiveDesign'
    },
    {
        id: '9',
        title: 'Pack Logos Vectoriels',
        price: 15.99,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFQzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSIzMCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvZ29zPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WZWN0b3JpZWxzPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNzAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QYWNrPC90ZXh0Pjwvc3ZnPg==',
        rating: 4.8,
        reviews: 134,
        category: 'Design',
        seller: 'LogoMaster'
    }
];

const BuyerDashboardPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { cart, favorites } = useAppSelector((state) => ({
        cart: state.cart,
        favorites: state.favorites
    }));

    // Debug logs
    console.log('🔍 BuyerDashboardPage - État:', {
        isAuthenticated,
        user: user?.firstName,
        cartItems: cart.items.length,
        favoritesCount: favorites.items.length,
        token: localStorage.getItem('crealith_token') ? 'présent' : 'absent'
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Charger les données au montage
    useEffect(() => {
        dispatch(fetchCart());
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleAddToCart = async (product: any) => {
        console.log('🛒 handleAddToCart appelé avec:', product);

        if (!isAuthenticated) {
            console.log('❌ Utilisateur non authentifié');
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour ajouter au panier',
                duration: 4000
            }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        console.log('✅ Utilisateur authentifié, ajout au panier...');
        try {
            await dispatch(addToCartAsync({ productId: product.id, quantity: 1 })).unwrap();
            // Synchroniser le panier après l'ajout
            await dispatch(fetchCart()).unwrap();
            dispatch(addNotification({ type: 'success', message: 'Ajouté au panier', duration: 2000 }));
            console.log('✅ Produit ajouté au panier avec succès');
        } catch (error: any) {
            console.error('❌ Erreur ajout au panier:', error);
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur ajout au panier',
                duration: 3000
            }));
        }
    };

    const isFavorite = (id: string) => favorites.items.some((p: any) => p.id === id);
    const handleToggleFavorite = async (product: any) => {
        console.log('❤️ handleToggleFavorite appelé avec:', product);
        console.log('❤️ Est déjà favori?', isFavorite(product.id));

        try {
            if (isFavorite(product.id)) {
                console.log('❤️ Suppression des favoris...');
                await dispatch(removeFavoriteAsync(product.id)).unwrap();
                dispatch(addNotification({ type: 'info', message: 'Retiré des favoris', duration: 2000 }));
                console.log('❤️ ✅ Supprimé des favoris');
            } else {
                console.log('❤️ Ajout aux favoris...');
                await dispatch(addFavoriteAsync(product.id)).unwrap();
                dispatch(addNotification({ type: 'success', message: 'Ajouté aux favoris', duration: 2000 }));
                console.log('❤️ ✅ Ajouté aux favoris');
            }
        } catch (error) {
            console.error('❤️ ❌ Erreur favoris:', error);
            dispatch(addNotification({ type: 'error', message: 'Erreur favoris', duration: 3000 }));
        }
    };

    const triggerSearch = () => {
        const q = (searchQuery || '').trim();
        if (!q) return;
        navigate(`/catalog?search=${encodeURIComponent(q)}`);
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
        <div className="bg-background-800 rounded-2xl border border-background-700 p-5 md:p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-500/15 rounded-xl">
                    <Icon className="w-6 h-6 text-primary-400" />
                </div>
                {change && typeof value === 'number' && value > 0 && (
                    <span className={cn(
                        'text-xs md:text-sm font-medium px-2 py-1 rounded-full',
                        trend === 'up' && 'text-success-400 bg-success-500/15',
                        trend === 'down' && 'text-error-400 bg-error-500/15',
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
                <div className="w-16 h-16 bg-background-700 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                        src={purchase.image}
                        alt={purchase.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback si l'image ne charge pas
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                    <div class="text-white text-xl" aria-hidden="true">📦</div>
                                  </div>
                                `;
                            }
                        }}
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
                <header className="bg-background-800 border-b border-background-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                                    <h1 className="text-xl md:text-2xl font-bold text-text-100">
                                        Bonjour, {user?.firstName} ! 👋
                                    </h1>
                                    <p className="text-text-400 text-sm md:text-base">
                                        Découvrez des créations uniques
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
                                    Panier ({cart.items.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content - Design Etsy Digital */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="space-y-8">
                        {/* Hero Section avec recherche intégrée */}
                        <section className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl border border-primary-500/20 p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-text-100 mb-4">
                                    Découvrez des créations uniques
                                </h1>
                                <p className="text-lg text-text-400 max-w-2xl mx-auto">
                                    Trouvez des produits numériques de qualité, créés par des designers talentueux
                                </p>
                            </div>

                            {/* Barre de recherche principale */}
                            <div className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher des produits, designers, catégories..."
                                        className="w-full pl-12 pr-4 py-4 bg-background-800 border border-background-600 rounded-xl text-text-100 placeholder-text-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); triggerSearch(); } }}
                                    />
                                    <button
                                        onClick={triggerSearch}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                    >
                                        Rechercher
                                    </button>
                                </div>
                            </div>

                            {/* Actions rapides */}
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <button
                                    onClick={() => navigate('/catalog?category=design')}
                                    className="px-4 py-2 bg-background-800 hover:bg-background-700 text-text-200 rounded-lg border border-background-600 transition-colors"
                                >
                                    Design
                                </button>
                                <button
                                    onClick={() => navigate('/catalog?category=marketing')}
                                    className="px-4 py-2 bg-background-800 hover:bg-background-700 text-text-200 rounded-lg border border-background-600 transition-colors"
                                >
                                    Marketing
                                </button>
                                <button
                                    onClick={() => navigate('/catalog?category=development')}
                                    className="px-4 py-2 bg-background-800 hover:bg-background-700 text-text-200 rounded-lg border border-background-600 transition-colors"
                                >
                                    Développement
                                </button>
                                <button
                                    onClick={() => navigate('/catalog?category=business')}
                                    className="px-4 py-2 bg-background-800 hover:bg-background-700 text-text-200 rounded-lg border border-background-600 transition-colors"
                                >
                                    Business
                                </button>
                            </div>
                        </section>

                        {/* Produits recommandés - Style Etsy (issus de l'API) */}
                        <section className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-text-100 mb-2">Recommandés pour vous</h2>
                                    <p className="text-text-400">Basé sur vos préférences et l'activité récente</p>
                                </div>
                                <button
                                    onClick={() => navigate('/catalog')}
                                    className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-primary-500/10"
                                >
                                    Voir tout
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Grille de produits (API) */}
                            <ProductGrid
                                products={useAppSelector((s) => s.products.items).slice(0, 8) as any}
                                cardVariant="minimal"
                                onView={(id) => navigate(`/product/${id}`)}
                                onToggleFavorite={(id) => handleToggleFavorite({ id })}
                            />
                        </section>

                        {/* Stats et activité récente */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Stats personnelles */}
                            <section className="bg-background-800 rounded-2xl border border-background-700 p-6">
                                <h2 className="text-xl font-bold text-text-100 mb-6">Votre activité</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <StatCard
                                        title="Achats"
                                        value={mockStats.totalPurchases}
                                        icon={ShoppingBag}
                                        change="+2 ce mois"
                                        trend="up"
                                    />
                                    <StatCard
                                        title="Dépensé"
                                        value={formatPrice(mockStats.totalSpent)}
                                        icon={DollarSign}
                                        change="+15%"
                                        trend="up"
                                    />
                                    <StatCard
                                        title="Favoris"
                                        value={mockStats.favoritesCount}
                                        icon={Heart}
                                        change="+3"
                                        trend="up"
                                    />
                                    <StatCard
                                        title="Téléchargements"
                                        value={mockStats.downloadsCount}
                                        icon={Download}
                                        change="+1"
                                        trend="up"
                                    />
                                </div>
                            </section>

                            {/* Achats récents */}
                            <section className="bg-background-800 rounded-2xl border border-background-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-text-100">Achats récents</h2>
                                    {mockRecentPurchases.length > 0 && (
                                        <button
                                            onClick={() => navigate('/downloads')}
                                            className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            Voir tout
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                {mockRecentPurchases.length === 0 ? (
                                    <div className="text-center text-text-400 py-8">
                                        <p className="mb-4">Vous n'avez encore aucun achat.</p>
                                        <button
                                            onClick={() => navigate('/catalog')}
                                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                        >
                                            Parcourir le catalogue
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {mockRecentPurchases.map((purchase) => (
                                            <RecentPurchaseCard key={purchase.id} purchase={purchase} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Actions rapides */}
                        <section className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            <h2 className="text-xl font-bold text-text-100 mb-6">Actions rapides</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => navigate('/favorites')}
                                    className="p-4 bg-background-700 hover:bg-background-600 rounded-xl border border-background-600 hover:border-secondary-500/30 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary-500/15 rounded-lg">
                                            <Heart className="w-5 h-5 text-secondary-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-text-100 group-hover:text-secondary-400 transition-colors">
                                                Mes favoris
                                            </h3>
                                            <p className="text-sm text-text-400">
                                                Produits sauvegardés
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/downloads')}
                                    className="p-4 bg-background-700 hover:bg-background-600 rounded-xl border border-background-600 hover:border-success-500/30 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-success-500/15 rounded-lg">
                                            <Download className="w-5 h-5 text-success-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-text-100 group-hover:text-success-400 transition-colors">
                                                Téléchargements
                                            </h3>
                                            <p className="text-sm text-text-400">
                                                Fichiers achetés
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/my-reviews')}
                                    className="p-4 bg-background-700 hover:bg-background-600 rounded-xl border border-background-600 hover:border-primary-500/30 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary-500/15 rounded-lg">
                                            <MessageSquare className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-text-100 group-hover:text-primary-400 transition-colors">
                                                Mes avis
                                            </h3>
                                            <p className="text-sm text-text-400">
                                                Avis et évaluations
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/invoices')}
                                    className="p-4 bg-background-700 hover:bg-background-600 rounded-xl border border-background-600 hover:border-primary-500/30 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary-500/15 rounded-lg">
                                            <FileText className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-text-100 group-hover:text-primary-400 transition-colors">
                                                Factures
                                            </h3>
                                            <p className="text-sm text-text-400">
                                                Historique des achats
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BuyerDashboardPage;