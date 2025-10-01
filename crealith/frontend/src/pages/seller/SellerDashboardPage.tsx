import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Eye,
    Star,
    Package,
    Users,
    Plus,
    BarChart3,
    Calendar,
    Download,
    Heart
} from 'lucide-react';
import { Sidebar } from '@/components/marketplace/Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';
import { productService } from '@/services/product.service';
import { apiService } from '@/services/api';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
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
    unreadMessages: 0
};

const mockRecentOrders: any[] = [];

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
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
    const { user, logout } = useAuth();
    // Produits (API)
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(6);
    const [sortBy, setSortBy] = useState<'createdAt' | 'downloadsCount' | 'price'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [total, setTotal] = useState(0);

    // State: create product modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createData, setCreateData] = useState<{ title: string; price: string; description: string; categorySlug: string }>(
        { title: '', price: '', description: '', categorySlug: 'templates' }
    );
    const [digitalFile, setDigitalFile] = useState<File | null>(null);
    const [digitalFileName, setDigitalFileName] = useState<string>('');

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
                    // Mapper les options de tri UI -> API backend
                    sortBy: sortBy,
                    sortDir: sortDir,
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

    // Activer l'onglet Produits quand le hash est #products (initial + navigation intra-page)
    useEffect(() => {
        if (location.hash === '#products') {
            setActiveTab('products');
        }
    }, [location.hash]);

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
                        <Icon className="w-5 h-5" />
                    </div>
                    {change && typeof value === 'number' && value > 0 && (
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
                        <ShoppingBag className="w-4 h-4 text-primary-400" />
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
            <div className="lg:ml-80 lg:pl-0">
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
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-text-100">
                                        Tableau de bord vendeur
                                    </h1>
                                </div>
                                <p className="text-text-400">
                                    Gérez votre boutique et suivez vos performances
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105">
                                <Plus className="w-4 h-4" />
                                Nouveau produit
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
                            { id: 'products', label: 'Produits', icon: Package }
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

                            {/* Charts retirés pour MVP */}

                            {/* Section condensée: Commandes récentes */}
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-text-100">Commandes récentes</h2>
                                    </div>
                                    {mockRecentOrders.length === 0 ? (
                                        <div className="text-center text-text-400 py-8">
                                            <p className="mb-4">Aucune commande récente.</p>
                                            <button
                                                onClick={() => setActiveTab('products')}
                                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                            >
                                                Voir mes produits
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {mockRecentOrders.map((order) => (
                                                <OrderCard key={order.id} order={order} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Vue d'ensemble produits du vendeur */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                                    <p className="text-sm text-text-400 mb-2">Nombre de produits</p>
                                    <p className="text-2xl font-bold text-text-100">{Math.max(total, products.length)}</p>
                                </div>
                                <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                                    <p className="text-sm text-text-400 mb-2">Total vendu (estimé)</p>
                                    <p className="text-2xl font-bold text-text-100">{products.reduce((sum, p: any) => sum + (p.totalSales || p.downloads || 0), 0)}</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <h2 className="text-xl font-bold text-text-100 mb-6">Actions rapides</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button onClick={() => setActiveTab('products')} className="p-6 bg-background-800 border border-background-700 rounded-xl hover:border-primary-500/30 transition-all duration-300 text-left group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 bg-primary-500/20 rounded-xl group-hover:bg-primary-500/30 transition-colors">
                                                <Plus className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-100">Ajouter un produit</p>
                                                <p className="text-sm text-text-400">Créer un nouveau produit</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Carte Analytics et Messages retirées pour MVP */}
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
                                    <span className="text-sm text-text-400">Trier:</span>
                                    <select
                                        value={`${sortBy}:${sortDir}`}
                                        onChange={(e) => {
                                            const [by, dir] = e.target.value.split(':');
                                            setSortBy((by as any) || 'createdAt');
                                            setSortDir((dir as any) || 'desc');
                                        }}
                                        className="px-3 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100"
                                    >
                                        <option value="createdAt:desc">Date (récent)</option>
                                        <option value="createdAt:asc">Date (ancien)</option>
                                        <option value="downloadsCount:desc">Populaire</option>
                                        <option value="price:asc">Prix (croissant)</option>
                                        <option value="price:desc">Prix (décroissant)</option>
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
                                {!productsLoading && !productsError && products.length === 0 && (
                                    <div className="col-span-full text-center text-text-400 py-10">
                                        Aucun produit pour le moment. Cliquez sur “Nouveau produit” pour commencer.
                                    </div>
                                )}
                                {!productsLoading && !productsError && products.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        variant="default"
                                        onQuickView={(productId: string) => navigate(`/seller/product/${productId}`)}
                                    />
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
                    {/* Sections non-implémentées retirées pour MVP */}
                </main>
            </div>

            {/* Create Product Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !creating && setShowCreateModal(false)} />
                    <div className="relative z-10 w-full max-w-lg bg-background-900 border border-background-700 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-text-100 mb-4">Nouveau produit</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-300 mb-1">Titre</label>
                                <input
                                    value={createData.title}
                                    onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100"
                                    placeholder="Nom du produit"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-300 mb-1">Prix (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={createData.price}
                                    onChange={(e) => setCreateData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100"
                                    placeholder="29.99"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-300 mb-1">Fichier numérique (ZIP/FIG/AI)</label>
                                <input
                                    type="file"
                                    accept=".zip,.fig,.ai"
                                    onChange={(e) => {
                                        const file = e.target.files && e.target.files[0];
                                        if (!file) return;
                                        setDigitalFile(file);
                                        setDigitalFileName(file.name);
                                    }}
                                    className="w-full text-sm text-text-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-background-700 file:text-text-200 hover:file:bg-background-600"
                                />
                                {digitalFileName && (
                                    <p className="mt-1 text-xs text-text-500">Sélectionné: {digitalFileName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-text-300 mb-1">Catégorie</label>
                                <select
                                    value={createData.categorySlug}
                                    onChange={(e) => setCreateData(prev => ({ ...prev, categorySlug: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100"
                                >
                                    <option value="templates">Templates</option>
                                    <option value="ui-kits">UI Kits</option>
                                    <option value="dashboards">Dashboards</option>
                                    <option value="illustrations">Illustrations</option>
                                    <option value="icons">Icônes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-text-300 mb-1">Description</label>
                                <textarea
                                    rows={4}
                                    value={createData.description}
                                    onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100"
                                    placeholder="Décrivez votre produit..."
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-background-800 border border-background-700 rounded-lg text-text-100 disabled:opacity-50"
                                onClick={() => setShowCreateModal(false)}
                                disabled={creating}
                            >
                                Annuler
                            </button>
                            <button
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
                                disabled={creating || !createData.title || !createData.price || !digitalFile}
                                onClick={async () => {
                                    setCreating(true);
                                    try {
                                        let created: any;
                                        let fileUrl: string | undefined;
                                        try {
                                            if (digitalFile) {
                                                const fd = new FormData();
                                                fd.append('file', digitalFile);
                                                fd.append('type', 'digital');
                                                // Endpoint mock côté backend; fallback si indisponible
                                                const uploadRes: any = await apiService.upload('/uploads', fd).catch(() => null);
                                                fileUrl = (uploadRes && (uploadRes.url || uploadRes.fileUrl)) || undefined;
                                            }
                                        } catch (_) {
                                            fileUrl = undefined;
                                        }
                                        try {
                                            created = await productService.createProduct({
                                                title: createData.title,
                                                price: createData.price,
                                                description: createData.description,
                                                fileUrl,
                                                category: { slug: createData.categorySlug },
                                                categoryId: createData.categorySlug,
                                            } as any);
                                        } catch (err) {
                                            // Fallback local si API indisponible
                                            created = {
                                                id: String(Date.now()),
                                                title: createData.title,
                                                price: createData.price,
                                                description: createData.description,
                                                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
                                                category: { slug: createData.categorySlug, id: createData.categorySlug, name: createData.categorySlug },
                                                categoryId: createData.categorySlug,
                                                fileUrl: fileUrl || '/files/mock-' + Date.now() + '.zip',
                                                downloads: 0,
                                                totalSales: 0,
                                                isActive: true,
                                                createdAt: new Date().toISOString(),
                                                updatedAt: new Date().toISOString(),
                                                userId: user?.id,
                                            };
                                        }
                                        setProducts(prev => [created, ...prev]);
                                        setTotal(prev => (prev || 0) + 1);
                                        setShowCreateModal(false);
                                        setActiveTab('products');
                                        setCreateData({ title: '', price: '', description: '', categorySlug: 'templates' });
                                        setDigitalFile(null);
                                        setDigitalFileName('');
                                        dispatch(addNotification({ type: 'success', message: 'Produit créé', duration: 2500 }));
                                    } catch (e) {
                                        dispatch(addNotification({ type: 'error', message: 'Erreur lors de la création', duration: 3500 }));
                                    } finally {
                                        setCreating(false);
                                    }
                                }}
                            >
                                {creating ? 'Création...' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
