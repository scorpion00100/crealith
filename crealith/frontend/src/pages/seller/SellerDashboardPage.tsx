import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Eye,
    Star,
    Package,
    Users,
    MessageSquare,
    Plus,
    BarChart3,
    Calendar,
    Download,
    Heart
} from 'lucide-react';
import { Sidebar } from '@/components/marketplace/Sidebar';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';
import { productService } from '@/services/product.service';
import { Product } from '@/types';

// Mock data for demonstration
const mockStats = {
    totalRevenue: 2847.50,
    monthlyRevenue: 892.30,
    totalSales: 156,
    monthlySales: 23,
    totalProducts: 12,
    activeProducts: 10,
    totalViews: 8942,
    monthlyViews: 1234,
    averageRating: 4.8,
    totalReviews: 89,
    pendingOrders: 3,
    unreadMessages: 7
};

const mockRecentOrders = [
    {
        id: '1',
        productName: 'Template PowerPoint Moderne',
        customerName: 'Jean Dupont',
        amount: 15.99,
        date: '2025-01-10',
        status: 'completed'
    },
    {
        id: '2',
        productName: 'Pack d\'icônes vectorielles',
        customerName: 'Marie Martin',
        amount: 8.50,
        date: '2025-01-09',
        status: 'pending'
    },
    {
        id: '3',
        productName: 'Mockup iPhone 15 Pro',
        customerName: 'Pierre Durand',
        amount: 12.00,
        date: '2025-01-08',
        status: 'completed'
    }
];

const mockTopProducts = [
    {
        id: '1',
        title: 'Template PowerPoint Moderne',
        price: 15.99,
        image: '/placeholder-product.jpg',
        sales: 45,
        revenue: 719.55,
        views: 1234,
        rating: 4.9,
        reviewCount: 23
    },
    {
        id: '2',
        title: 'Pack d\'icônes vectorielles',
        price: 8.50,
        image: '/placeholder-product.jpg',
        sales: 38,
        revenue: 323.00,
        views: 987,
        rating: 4.8,
        reviewCount: 18
    },
    {
        id: '3',
        title: 'Mockup iPhone 15 Pro',
        price: 12.00,
        image: '/placeholder-product.jpg',
        sales: 32,
        revenue: 384.00,
        views: 1456,
        rating: 4.7,
        reviewCount: 15
    }
];

const mockAnalyticsData = {
    revenueChart: [
        { month: 'Jan', revenue: 1200 },
        { month: 'Fév', revenue: 1500 },
        { month: 'Mar', revenue: 1800 },
        { month: 'Avr', revenue: 2200 },
        { month: 'Mai', revenue: 1900 },
        { month: 'Juin', revenue: 2847 }
    ],
    salesChart: [
        { month: 'Jan', sales: 45 },
        { month: 'Fév', sales: 52 },
        { month: 'Mar', sales: 68 },
        { month: 'Avr', sales: 78 },
        { month: 'Mai', sales: 65 },
        { month: 'Juin', sales: 156 }
    ]
};

export const SellerDashboardPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'revenue'>('overview');
    const { user, logout } = useAuth();
    // Produits (API)
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(6);
    const [sortBy, setSortBy] = useState<'createdAt' | 'sales' | 'price'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) return;
            setProductsLoading(true);
            setProductsError(null);
            try {
                const res = await productService.getProducts({
                    userId: user.id as any,
                    page,
                    pageSize,
                    sortBy,
                    sortDir,
                } as any);
                setProducts(res.products || []);
                setTotal(res.total || res.products?.length || 0);
            } catch (e: any) {
                setProductsError(e?.message || 'Erreur lors du chargement des produits');
            } finally {
                setProductsLoading(false);
            }
        };
        // Charger les produits quand l'onglet produits est actif
        if (activeTab === 'products') {
            fetchProducts();
        }
    }, [user, activeTab, page, pageSize, sortBy, sortDir]);

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
        color?: 'primary' | 'secondary' | 'success' | 'warning';
    }> = ({ title, value, icon: Icon, change, trend = 'neutral', color = 'primary' }) => {
        const colorClasses = {
            primary: 'bg-primary-500/20 text-primary-400',
            secondary: 'bg-secondary-500/20 text-secondary-400',
            success: 'bg-success-500/20 text-success-400',
            warning: 'bg-warning-500/20 text-warning-400'
        };

        return (
            <div className="bg-background-800 rounded-2xl border border-background-700 p-6 hover:border-primary-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn('p-3 rounded-xl', colorClasses[color])}>
                        <Icon className="w-6 h-6" />
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
    };

    const OrderCard: React.FC<{ order: any }> = ({ order }) => (
        <div className="bg-background-800 rounded-xl border border-background-700 p-4 hover:border-primary-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                        <h4 className="font-medium text-text-100">{order.productName}</h4>
                        <p className="text-sm text-text-400">par {order.customerName}</p>
                    </div>
                </div>
                <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    order.status === 'completed'
                        ? 'bg-success-500/20 text-success-400'
                        : 'bg-warning-500/20 text-warning-400'
                )}>
                    {order.status === 'completed' ? 'Terminé' : 'En attente'}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-400">
                    {formatPrice(order.amount)}
                </span>
                <span className="text-sm text-text-400">
                    {new Date(order.date).toLocaleDateString('fr-FR')}
                </span>
            </div>
        </div>
    );

    const SimpleChart: React.FC<{ data: any[]; title: string; color?: string }> = ({
        data,
        title,
        color = 'primary'
    }) => {
        const maxValue = Math.max(...data.map(d => d.revenue || d.sales));

        return (
            <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                <h3 className="text-lg font-bold text-text-100 mb-4">{title}</h3>
                <div className="flex items-end gap-2 h-32">
                    {data.map((item, index) => {
                        const height = ((item.revenue || item.sales) / maxValue) * 100;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className={cn(
                                        'w-full rounded-t transition-all duration-500 hover:opacity-80',
                                        color === 'primary' && 'bg-primary-500',
                                        color === 'secondary' && 'bg-secondary-500',
                                        color === 'success' && 'bg-success-500'
                                    )}
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-xs text-text-400 mt-2">{item.month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background-900">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                variant="seller"
            />

            {/* Main Content */}
            <div className="lg:ml-80">
                {/* Header */}
                <header className="bg-background-800 border-b border-background-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-text-400 hover:text-text-200 hover:bg-background-700 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-text-100">
                                    Tableau de bord vendeur 🚀
                                </h1>
                                <p className="text-text-400">
                                    Gérez votre boutique et suivez vos performances
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105">
                                <Plus className="w-4 h-4" />
                                Nouveau produit
                            </button>
                            <button className="p-2 text-text-400 hover:text-text-200 hover:bg-background-700 rounded-lg transition-colors">
                                <MessageSquare className="w-6 h-6" />
                                {mockStats.unreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {mockStats.unreadMessages}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 bg-background-800 p-1 rounded-2xl w-fit">
                        {[
                            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
                            { id: 'products', label: 'Produits', icon: Package },
                            { id: 'orders', label: 'Commandes', icon: ShoppingBag },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                            { id: 'revenue', label: 'Revenus', icon: DollarSign }
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
                            {/* Key Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Revenus totaux"
                                    value={formatPrice(mockStats.totalRevenue)}
                                    icon={DollarSign}
                                    change="+15% ce mois"
                                    trend="up"
                                    color="success"
                                />
                                <StatCard
                                    title="Ventes totales"
                                    value={mockStats.totalSales}
                                    icon={ShoppingBag}
                                    change="+8% ce mois"
                                    trend="up"
                                    color="primary"
                                />
                                <StatCard
                                    title="Produits actifs"
                                    value={`${mockStats.activeProducts}/${mockStats.totalProducts}`}
                                    icon={Package}
                                    change="+2 nouveaux"
                                    trend="up"
                                    color="secondary"
                                />
                                <StatCard
                                    title="Note moyenne"
                                    value={mockStats.averageRating}
                                    icon={Star}
                                    change="+0.2"
                                    trend="up"
                                    color="warning"
                                />
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SimpleChart
                                    data={mockAnalyticsData.revenueChart}
                                    title="Évolution des revenus"
                                    color="success"
                                />
                                <SimpleChart
                                    data={mockAnalyticsData.salesChart}
                                    title="Évolution des ventes"
                                    color="primary"
                                />
                            </div>

                            {/* Recent Orders & Top Products */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-text-100">Commandes récentes</h2>
                                        <button className="text-primary-400 hover:text-primary-300 font-medium">
                                            Voir tout
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {mockRecentOrders.map((order) => (
                                            <OrderCard key={order.id} order={order} />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-text-100">Produits populaires</h2>
                                        <button className="text-primary-400 hover:text-primary-300 font-medium">
                                            Voir tout
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {mockTopProducts.map((product) => (
                                            <div key={product.id} className="bg-background-800 rounded-xl border border-background-700 p-4 hover:border-primary-500/30 transition-all duration-300">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 bg-background-700 rounded-lg flex-shrink-0">
                                                        <img
                                                            src={product.image}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-text-100 truncate">{product.title}</h4>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-text-400">
                                                            <span>{product.sales} ventes</span>
                                                            <span>{product.views} vues</span>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                                <span>{product.rating}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <span className="text-lg font-bold text-primary-400">
                                                                {formatPrice(product.revenue)}
                                                            </span>
                                                            <span className="text-sm text-text-400">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <h2 className="text-xl font-bold text-text-100 mb-6">Actions rapides</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button onClick={() => setActiveTab('products')} className="p-6 bg-background-800 border border-background-700 rounded-xl hover:border-primary-500/30 transition-all duration-300 text-left group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 bg-primary-500/20 rounded-xl group-hover:bg-primary-500/30 transition-colors">
                                                <Plus className="w-6 h-6 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-100">Ajouter un produit</p>
                                                <p className="text-sm text-text-400">Créer un nouveau produit</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button aria-disabled title="Bientôt disponible" className="p-6 bg-background-800 border border-background-700 rounded-xl transition-all duration-300 text-left opacity-70 cursor-not-allowed">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 bg-secondary-500/20 rounded-xl">
                                                <BarChart3 className="w-6 h-6 text-secondary-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-100">Analytics détaillées</p>
                                                <p className="text-sm text-text-400">Voir les statistiques</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button aria-disabled title="Bientôt disponible" className="p-6 bg-background-800 border border-background-700 rounded-xl transition-all duration-300 text-left opacity-70 cursor-not-allowed">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 bg-success-500/20 rounded-xl">
                                                <MessageSquare className="w-6 h-6 text-success-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-100">Messages</p>
                                                <p className="text-sm text-text-400">Bientôt disponible</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other tabs content would go here */}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            {/* Tri */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-400">Trier par:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="px-3 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100"
                                    >
                                        <option value="createdAt">Date</option>
                                        <option value="sales">Ventes</option>
                                        <option value="price">Prix</option>
                                    </select>
                                    <select
                                        value={sortDir}
                                        onChange={(e) => setSortDir(e.target.value as any)}
                                        className="px-3 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100"
                                    >
                                        <option value="desc">Desc</option>
                                        <option value="asc">Asc</option>
                                    </select>
                                </div>
                                <div className="text-sm text-text-400">{total} produits</div>
                            </div>

                            {/* Grille */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productsLoading && (
                                    <div className="col-span-full flex justify-center py-12">
                                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                {productsError && (
                                    <div className="col-span-full text-error-400">{productsError}</div>
                                )}
                                {!productsLoading && !productsError && products.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {Math.ceil(Math.max(1, total) / pageSize) > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        className="px-3 py-1 bg-background-800 border border-background-700 rounded-lg text-text-100 disabled:opacity-50"
                                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                        disabled={page === 1}
                                    >
                                        Précédent
                                    </button>
                                    <span className="text-text-400 text-sm">Page {page} / {Math.ceil(Math.max(1, total) / pageSize)}</span>
                                    <button
                                        className="px-3 py-1 bg-background-800 border border-background-700 rounded-lg text-text-100 disabled:opacity-50"
                                        onClick={() => setPage((prev) => prev + 1)}
                                        disabled={page >= Math.ceil(Math.max(1, total) / pageSize)}
                                    >
                                        Suivant
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab !== 'overview' && activeTab !== 'products' && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-background-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-12 h-12 text-text-400" />
                            </div>
                            <h3 className="text-xl font-bold text-text-100 mb-2">
                                {activeTab === 'orders' && 'Gestion des commandes'}
                                {activeTab === 'analytics' && 'Analytics détaillées'}
                                {activeTab === 'revenue' && 'Gestion des revenus'}
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
