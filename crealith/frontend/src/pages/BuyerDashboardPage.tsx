import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/notificationSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatsCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { OrderCard, Order } from '@/components/ui/OrderCard';
import { AnalyticsChart } from '@/components/ui/AnalyticsChart';
import { DashboardFilters, FilterOptions } from '@/components/ui/DashboardFilters';
import {
    ShoppingBag,
    Download,
    Star,
    Euro,
    Calendar,
    TrendingUp,
    Package,
    Heart,
    Eye,
    ArrowRight,
    Plus,
    Filter,
    Search
} from 'lucide-react';

export const BuyerDashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { orders, loading: ordersLoading, filters, setFilters, downloadProduct, getOrderStats } = useOrders();
    const { data: analyticsData, loading: analyticsLoading, period, setPeriod } = useAnalytics('buyer');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                id: Date.now().toString(),
                type: 'warning',
                title: 'Connexion requise',
                message: 'Vous devez être connecté pour accéder au dashboard acheteur',
                read: false,
                createdAt: new Date().toISOString()
            }));
            navigate('/login?redirect=/buyer-dashboard');
            return;
        }

        if (user?.role !== 'BUYER') {
            dispatch(addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Accès refusé',
                message: 'Accès réservé aux acheteurs',
                read: false,
                createdAt: new Date().toISOString()
            }));
            navigate('/dashboard');
            return;
        }
    }, [isAuthenticated, user, navigate, dispatch]);

    if (!isAuthenticated || !user || user.role !== 'BUYER') {
        return null;
    }

    const handleDownload = async (productId: string) => {
        const result = await downloadProduct(productId);

        if (result.success) {
            dispatch(addNotification({
                id: Date.now().toString(),
                type: 'success',
                title: 'Téléchargement réussi',
                message: result.message,
                read: false,
                createdAt: new Date().toISOString()
            }));
        } else {
            dispatch(addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Erreur',
                message: result.message,
                read: false,
                createdAt: new Date().toISOString()
            }));
        }
    };

    const handleReview = (productId: string) => {
        navigate(`/product/${productId}?tab=reviews`);
    };

    const handleViewProduct = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    const handleFiltersChange = (newFilters: FilterOptions) => {
        setFilters({
            status: newFilters.status || [],
            dateRange: newFilters.dateRange || { start: '', end: '' },
            search: newFilters.search || ''
        });
    };

    const handleClearFilters = () => {
        setFilters({
            status: [],
            dateRange: { start: '', end: '' },
            search: ''
        });
    };

    // Mock data pour les statistiques
    const stats = [
        {
            title: 'Commandes totales',
            value: orders.length,
            change: '+12%',
            changeType: 'positive' as const,
            icon: <ShoppingBag className="w-6 h-6" />,
            color: 'primary'
        },
        {
            title: 'Produits téléchargés',
            value: 24,
            change: '+8%',
            changeType: 'positive' as const,
            icon: <Download className="w-6 h-6" />,
            color: 'secondary'
        },
        {
            title: 'Montant dépensé',
            value: '€1,247',
            change: '+15%',
            changeType: 'positive' as const,
            icon: <Euro className="w-6 h-6" />,
            color: 'warm'
        },
        {
            title: 'Avis laissés',
            value: 8,
            change: '+3',
            changeType: 'positive' as const,
            icon: <Star className="w-6 h-6" />,
            color: 'accent'
        }
    ];

    const recentOrders = orders.slice(0, 5);

    return (
        <DashboardLayout
            variant="buyer"
            title="Tableau de bord Acheteur"
            subtitle="Gérez vos commandes et téléchargements"
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatsCard key={index} className="group hover:shadow-medium transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-earth-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-earth-900">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                                        }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-earth-500 ml-1">vs mois dernier</span>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary-100 text-primary-600' :
                                stat.color === 'secondary' ? 'bg-secondary-100 text-secondary-600' :
                                    stat.color === 'warm' ? 'bg-warm-100 text-warm-600' :
                                        'bg-accent-100 text-accent-600'
                                } group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                        </div>
                    </StatsCard>
                ))}
            </div>

            {/* Main Content Tabs */}
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-earth-200">
                    {[
                        { id: 'overview', label: 'Vue d\'ensemble', icon: <TrendingUp className="w-4 h-4" /> },
                        { id: 'orders', label: 'Mes commandes', icon: <ShoppingBag className="w-4 h-4" /> },
                        { id: 'downloads', label: 'Téléchargements', icon: <Download className="w-4 h-4" /> },
                        { id: 'favorites', label: 'Favoris', icon: <Heart className="w-4 h-4" /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                : 'text-earth-600 hover:bg-earth-50 hover:text-earth-900'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Analytics Chart */}
                        <div className="lg:col-span-2">
                            <Card variant="elevated" padding="lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-earth-900">Activité récente</h3>
                                    <div className="flex items-center space-x-2">
                                        <select
                                            value={period}
                                            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
                                            className="px-3 py-1 text-sm border border-earth-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="week">7 jours</option>
                                            <option value="month">30 jours</option>
                                            <option value="year">90 jours</option>
                                        </select>
                                    </div>
                                </div>
                                {analyticsLoading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                    </div>
                                ) : analyticsData ? (
                                    <AnalyticsChart data={analyticsData} />
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-earth-500">
                                        Aucune donnée disponible
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Recent Orders */}
                        <div>
                            <Card variant="elevated" padding="lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-earth-900">Commandes récentes</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveTab('orders')}
                                        icon={<ArrowRight className="w-4 h-4" />}
                                        iconPosition="right"
                                    >
                                        Voir tout
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {recentOrders.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                                            <p className="text-earth-500">Aucune commande récente</p>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => navigate('/catalog')}
                                            >
                                                Découvrir des produits
                                            </Button>
                                        </div>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <div key={order.id} className="flex items-center space-x-3 p-3 bg-earth-50 rounded-xl">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-earth-900 truncate">
                                                        {order.product?.title || 'Produit inconnu'}
                                                    </p>
                                                    <p className="text-xs text-earth-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <StatusBadge status={order.status} size="sm">
                                                    {order.status}
                                                </StatusBadge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <Card padding="lg">
                            <DashboardFilters
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onClearFilters={handleClearFilters}
                                variant="buyer"
                            />
                        </Card>

                        {/* Orders List */}
                        <div className="space-y-4">
                            {ordersLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <Card key={index} className="animate-pulse">
                                            <div className="h-48 bg-earth-200 rounded-t-2xl"></div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-earth-200 rounded"></div>
                                                <div className="h-6 bg-earth-200 rounded w-2/3"></div>
                                                <div className="h-8 bg-earth-200 rounded"></div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : orders.length === 0 ? (
                                <Card className="text-center py-12">
                                    <ShoppingBag className="w-16 h-16 text-earth-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-earth-900 mb-2">Aucune commande</h3>
                                    <p className="text-earth-500 mb-6">Commencez à acheter des produits digitaux</p>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/catalog')}
                                        icon={<Plus className="w-4 h-4" />}
                                    >
                                        Explorer le catalogue
                                    </Button>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {orders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onDownload={handleDownload}
                                            onReview={handleReview}
                                            onViewProduct={handleViewProduct}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'downloads' && (
                    <Card className="text-center py-12">
                        <Download className="w-16 h-16 text-earth-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-earth-900 mb-2">Téléchargements</h3>
                        <p className="text-earth-500 mb-6">Accédez à tous vos produits téléchargés</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/catalog')}
                            icon={<Eye className="w-4 h-4" />}
                        >
                            Voir mes produits
                        </Button>
                    </Card>
                )}

                {activeTab === 'favorites' && (
                    <Card className="text-center py-12">
                        <Heart className="w-16 h-16 text-earth-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-earth-900 mb-2">Favoris</h3>
                        <p className="text-earth-500 mb-6">Retrouvez vos produits favoris</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/favorites')}
                            icon={<Heart className="w-4 h-4" />}
                        >
                            Voir mes favoris
                        </Button>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};
