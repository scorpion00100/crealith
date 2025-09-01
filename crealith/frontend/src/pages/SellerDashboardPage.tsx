import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/notificationSlice';
import { ProductCard } from '@/components/ui/ProductCard';
import { Product } from '@/types';
import { AnalyticsChart } from '@/components/ui/AnalyticsChart';
import { DashboardFilters, FilterOptions } from '@/components/ui/DashboardFilters';
import { ProductUploadForm } from '@/components/ui/ProductUploadForm';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Download,
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Settings,
  Package
} from 'lucide-react';

export const SellerDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: analyticsData, loading: analyticsLoading, period, setPeriod } = useAnalytics('seller');
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Template WordPress Premium',
      description: 'Un template WordPress moderne et responsive',
      price: '29.99',
      originalPrice: '39.99',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=Template+WordPress',
      fileType: 'zip',
      downloadsCount: 45,
      salesCount: 15,
      rating: 4.8,
      reviewCount: 12,
      status: 'active',
      isFeatured: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:20:00Z',
      category: { id: '1', name: 'Templates', slug: 'templates' },
      tags: ['wordpress', 'template', 'responsive']
    },
    {
      id: '2',
      title: 'Pack d\'icônes SVG',
      description: 'Collection de 100 icônes SVG modernes',
      price: 12.99,
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=Pack+Icons',
      fileType: 'svg',
      downloadsCount: 24,
      salesCount: 8,
      rating: 4.6,
      reviewCount: 5,
      status: 'active',
      isFeatured: false,
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      category: { id: '2', name: 'Graphiques', slug: 'graphics' },
      tags: ['icons', 'svg', 'design']
    },
    {
      id: '3',
      title: 'E-book Marketing Digital',
      description: 'Guide complet du marketing digital',
      price: '19.99',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=E-book+Marketing',
      fileType: 'pdf',
      downloadsCount: 0,
      salesCount: 0,
      rating: 0,
      reviewCount: 0,
      status: 'draft',
      isFeatured: false,
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z',
      category: { id: '3', name: 'E-books', slug: 'ebooks' },
      tags: ['marketing', 'digital', 'guide']
    }
  ]);
  const [filters, setFilters] = useState({
    status: [] as string[],
    dateRange: { start: '', end: '' },
    search: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour accéder au dashboard vendeur',
        read: false,
        createdAt: new Date().toISOString()
      }));
      navigate('/login?redirect=/seller-dashboard');
      return;
    }

    if (user?.role !== 'SELLER') {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Accès refusé',
        message: 'Accès réservé aux vendeurs',
        read: false,
        createdAt: new Date().toISOString()
      }));
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  if (!isAuthenticated || !user || user.role !== 'SELLER') {
    return null;
  }

  const getUserInitials = () => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleProductEdit = (productId: string) => {
    // Naviguer vers la page d'édition ou ouvrir un modal
    console.log('Edit product:', productId);
  };

  const handleProductDelete = (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Produit supprimé',
        message: 'Le produit a été supprimé avec succès',
        read: false,
        createdAt: new Date().toISOString()
      }));
    }
  };

  const handleProductView = (productId: string) => {
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

  const getProductStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.salesCount), 0);
    const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0);
    const totalDownloads = products.reduce((sum, p) => sum + p.downloadsCount, 0);
    const averageRating = products.filter(p => p.rating > 0).reduce((sum, p) => sum + p.rating, 0) / products.filter(p => p.rating > 0).length || 0;

    return {
      totalProducts,
      activeProducts,
      totalRevenue,
      totalSales,
      totalDownloads,
      averageRating
    };
  };

  const stats = getProductStats();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produits vendus</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSales}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Téléchargements</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDownloads}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageRating.toFixed(1)}/5</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      {analyticsData && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Analytics de vente</h3>
          </div>
          <div className="p-6">
            <AnalyticsChart
              data={analyticsData}
              period={period}
              onPeriodChange={setPeriod}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900 font-medium">Ajouter un produit</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Package className="w-5 h-5 text-green-600" />
            <span className="text-green-900 font-medium">Gérer mes produits</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-purple-900 font-medium">Voir les analytics</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductsSection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes produits</h2>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        variant="seller"
      />

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="seller"
            onView={handleProductView}
            onEdit={handleProductEdit}
            onDelete={handleProductDelete}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-600 mb-6">Commencez par ajouter votre premier produit</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ajouter un produit
          </button>
        </div>
      )}
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics détaillées</h2>
          <p className="text-gray-600 mt-1">Analysez vos performances de vente</p>
        </div>
      </div>

      {analyticsData && (
        <AnalyticsChart
          data={analyticsData}
          period={period}
          onPeriodChange={setPeriod}
        />
      )}
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres du compte</h3>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {getUserInitials()}
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mt-1">
              Vendeur
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Paramètres du compte</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <DollarSign className="w-4 h-4" />
            <span>Gérer les paiements</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Vendeur</h1>
              <p className="text-gray-600">Bienvenue, {user.firstName} !</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un produit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
              { id: 'products', label: 'Mes produits', icon: Package },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProductsSection()}
        {activeTab === 'analytics' && renderAnalyticsSection()}
        {activeTab === 'settings' && renderSettingsSection()}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un produit</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ProductUploadForm onSuccess={() => setShowUploadForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
