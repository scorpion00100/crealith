import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store';

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: string;
  totalDownloads: number;
}

interface RecentActivity {
  id: number;
  type: 'sale' | 'download' | 'review' | 'upload';
  title: string;
  subtitle: string;
  amount?: string;
  time: string;
  status?: 'completed' | 'pending' | 'processing';
}

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sales' | 'analytics'>('overview');

  // Sélecteurs Redux
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const { products } = useAppSelector(state => state.products);

  // Redirection si pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Vous devez être connecté pour accéder au dashboard',
        duration: 4000
      }));
    }
  }, [isAuthenticated, dispatch]);

  // Calculer les statistiques basées sur les données utilisateur
  const userStats: DashboardStats = useMemo(() => {
    if (!user) {
      return {
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: '0,00 €',
        totalDownloads: 0
      };
    }

    // Filtrer les produits de l'utilisateur connecté
    const userProducts = products.filter(product => product.userId === user.id);

    const totalProducts = userProducts.length;
    const totalSales = userProducts.reduce((sum, product) => sum + (product.totalSales || 0), 0);
    const totalDownloads = userProducts.reduce((sum, product) => sum + (product.downloadsCount || 0), 0);

    // Calculer les revenus (en supposant 80% de commission vendeur)
    const grossRevenue = userProducts.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      const sales = product.totalSales || 0;
      return sum + (price * sales);
    }, 0);

    const netRevenue = grossRevenue * 0.8; // Commission 80%
    const totalRevenue = `${netRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;

    return {
      totalProducts,
      totalSales,
      totalRevenue,
      totalDownloads
    };
  }, [user, products]);

  // Activités récentes simulées (dans un vrai projet, ça viendrait d'un slice dédié)
  const recentActivity: RecentActivity[] = useMemo(() => {
    if (!user) return [];

    const userProducts = products.filter(product => product.userId === user.id);

    return userProducts.slice(0, 4).map((product, index) => ({
      id: index + 1,
      type: index % 2 === 0 ? 'sale' : 'download',
      title: product.title,
      subtitle: index % 2 === 0
        ? `Vendu à un utilisateur`
        : `${Math.floor(Math.random() * 20) + 5} nouveaux téléchargements`,
      amount: index % 2 === 0 ? product.price : undefined,
      time: `Il y a ${Math.floor(Math.random() * 24) + 1}h`,
      status: 'completed'
    }));
  }, [user, products]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'download': return '📥';
      case 'review': return '⭐';
      case 'upload': return '📤';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated || !user) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="dashboard-header">
            <div className="header-content">
              <h1>Accès refusé</h1>
              <p>Vous devez être connecté pour accéder au dashboard</p>
            </div>
            <div className="header-actions">
              <Link to="/login" className="btn btn-primary">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Dashboard</h1>
            <p>
              Bonjour {user.firstName}, gérez vos produits et suivez vos performances
            </p>
          </div>
          <div className="header-actions">
            <Link to="/upload" className="btn btn-primary">
              + Nouveau produit
            </Link>
            <Link to="/profile" className="btn btn-outline">
              Profil
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button
            className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Mes produits ({userStats.totalProducts})
          </button>
          <button
            className={`nav-tab ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            Ventes ({userStats.totalSales})
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytiques
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">📦</div>
                  <div className="stat-content">
                    <div className="stat-number">{userStats.totalProducts}</div>
                    <div className="stat-label">Produits publiés</div>
                  </div>
                  <div className="stat-trend positive">
                    {userStats.totalProducts > 0 ? `+${userStats.totalProducts} produits` : 'Aucun produit'}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">💰</div>
                  <div className="stat-content">
                    <div className="stat-number">{userStats.totalSales}</div>
                    <div className="stat-label">Ventes totales</div>
                  </div>
                  <div className="stat-trend positive">
                    {userStats.totalSales > 0 ? `${userStats.totalSales} ventes` : 'Aucune vente'}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">💎</div>
                  <div className="stat-content">
                    <div className="stat-number">{userStats.totalRevenue}</div>
                    <div className="stat-label">Revenus totaux</div>
                  </div>
                  <div className="stat-trend positive">Commission 80%</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">📥</div>
                  <div className="stat-content">
                    <div className="stat-number">{userStats.totalDownloads}</div>
                    <div className="stat-label">Téléchargements</div>
                  </div>
                  <div className="stat-trend positive">
                    {userStats.totalDownloads > 0 ? `${userStats.totalDownloads} téléchargements` : 'Aucun téléchargement'}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="dashboard-section">
                <h2>Activité récente</h2>
                {recentActivity.length > 0 ? (
                  <div className="activity-list">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-subtitle">{activity.subtitle}</div>
                        </div>
                        <div className="activity-meta">
                          {activity.amount && (
                            <div className="activity-amount">{activity.amount}</div>
                          )}
                          <div className="activity-time">{activity.time}</div>
                          {activity.status && (
                            <div className={`activity-status ${getStatusColor(activity.status)}`}>
                              {activity.status === 'completed' && '✓'}
                              {activity.status === 'pending' && '⏳'}
                              {activity.status === 'processing' && '🔄'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>Aucune activité récente</h3>
                    <p>Commencez par publier votre premier produit pour voir l'activité ici</p>
                    <Link to="/upload" className="btn btn-primary">
                      Publier un produit
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="dashboard-section">
                <h2>Actions rapides</h2>
                <div className="quick-actions-grid">
                  <Link to="/upload" className="quick-action-card">
                    <div className="action-icon">📤</div>
                    <h3>Uploader un produit</h3>
                    <p>Partagez vos nouvelles créations</p>
                  </Link>

                  <div
                    className="quick-action-card"
                    onClick={() => setActiveTab('analytics')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="action-icon">📊</div>
                    <h3>Voir les analytics</h3>
                    <p>Analysez vos performances</p>
                  </div>

                  <Link to="/messages" className="quick-action-card">
                    <div className="action-icon">💬</div>
                    <h3>Messages</h3>
                    <p>Répondez aux questions clients</p>
                  </Link>

                  <Link to="/payouts" className="quick-action-card">
                    <div className="action-icon">💳</div>
                    <h3>Paiements</h3>
                    <p>Gérez vos revenus</p>
                  </Link>
                </div>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Mes produits</h2>
                <Link to="/upload" className="btn btn-primary">
                  + Ajouter un produit
                </Link>
              </div>

              {products.filter(p => p.userId === user.id).length > 0 ? (
                <div className="products-table">
                  <div className="table-header">
                    <div className="table-cell">Produit</div>
                    <div className="table-cell">Prix</div>
                    <div className="table-cell">Ventes</div>
                    <div className="table-cell">Revenus</div>
                    <div className="table-cell">Statut</div>
                    <div className="table-cell">Actions</div>
                  </div>

                  {products.filter(p => p.userId === user.id).map((product) => {
                    const revenue = (parseFloat(product.price) * (product.totalSales || 0) * 0.8).toFixed(2);

                    return (
                      <div key={product.id} className="table-row">
                        <div className="table-cell">
                          <div className="product-info">
                            <img
                              src={product.thumbnailUrl || "https://via.placeholder.com/60x40"}
                              alt={product.title}
                              className="product-thumb"
                            />
                            <div>
                              <div className="product-name">{product.title}</div>
                              <div className="product-date">
                                Publié le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="table-cell">{product.price}</div>
                        <div className="table-cell">{product.totalSales || 0}</div>
                        <div className="table-cell">{revenue} €</div>
                        <div className="table-cell">
                          <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                            {product.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="table-cell">
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => dispatch(addNotification({
                                type: 'info',
                                message: 'Édition bientôt disponible',
                                duration: 3000
                              }))}
                              title="Éditer"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => window.open(product.thumbnailUrl, '_blank')}
                              title="Voir"
                            >
                              👁️
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => setActiveTab('analytics')}
                              title="Analytics"
                            >
                              📊
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>Aucun produit publié</h3>
                  <p>Commencez par publier votre premier produit sur la marketplace</p>
                  <Link to="/upload" className="btn btn-primary">
                    Publier mon premier produit
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="dashboard-section">
              <h2>Historique des ventes</h2>
              {userStats.totalSales > 0 ? (
                <div className="sales-table">
                  <div className="table-header">
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Produit</div>
                    <div className="table-cell">Acheteur</div>
                    <div className="table-cell">Prix</div>
                    <div className="table-cell">Commission</div>
                    <div className="table-cell">Statut</div>
                  </div>

                  {/* Simulation de ventes */}
                  {products.filter(p => p.userId === user.id && (p.totalSales || 0) > 0).map((product) => (
                    <div key={`sale-${product.id}`} className="table-row">
                      <div className="table-cell">
                        {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="table-cell">{product.title}</div>
                      <div className="table-cell">Utilisateur anonyme</div>
                      <div className="table-cell">{product.price}</div>
                      <div className="table-cell">{(parseFloat(product.price) * 0.8).toFixed(2)} €</div>
                      <div className="table-cell">
                        <span className="status-badge completed">Terminé</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>Aucune vente enregistrée</h3>
                  <p>Vos ventes apparaîtront ici une fois que vos produits commenceront à se vendre</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="dashboard-section">
              <h2>Analytiques détaillées</h2>
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>Performances ce mois</h3>
                  <div className="analytics-chart">
                    <div className="chart-placeholder">
                      📈 Graphique des performances
                      <br />
                      <small>Intégration charts à venir</small>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Vos produits les plus populaires</h3>
                  <div className="popular-products">
                    {products
                      .filter(p => p.userId === user.id)
                      .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
                      .slice(0, 3)
                      .map((product, index) => (
                        <div key={product.id} className="popular-item">
                          <div className="popular-rank">#{index + 1}</div>
                          <div className="popular-info">
                            <div className="popular-name">{product.title}</div>
                            <div className="popular-sales">
                              {product.totalSales || 0} ventes • {product.downloadsCount || 0} téléchargements
                            </div>
                          </div>
                          <div className="popular-revenue">
                            {((parseFloat(product.price) * (product.totalSales || 0)) * 0.8).toFixed(2)} €
                          </div>
                        </div>
                      ))}

                    {products.filter(p => p.userId === user.id).length === 0 && (
                      <div className="empty-state-small">
                        <p>Aucun produit à analyser</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
