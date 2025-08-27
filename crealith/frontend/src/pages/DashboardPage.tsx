import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Vous devez être connecté pour accéder au dashboard',
        duration: 4000,
      }));
      navigate('/login?redirect=/dashboard');
      return;
    }
  }, [isAuthenticated, navigate, dispatch]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const isSeller = user.role === 'SELLER';
  const isAdmin = user.role === 'ADMIN';

  const renderOverview = () => (
    <div className="dashboard-overview">
      <h2>Vue d'ensemble</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Produits achetés</h3>
            <p className="stat-number">12</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Avis laissés</h3>
            <p className="stat-number">8</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>Total dépensé</h3>
            <p className="stat-number">€245.50</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Membre depuis</h3>
            <p className="stat-number">3 mois</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSellerDashboard = () => (
    <div className="seller-dashboard">
      <h2>Dashboard Vendeur</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Produits vendus</h3>
            <p className="stat-number">25</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Revenus totaux</h3>
            <p className="stat-number">€1,245.80</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Note moyenne</h3>
            <p className="stat-number">4.7/5</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📥</div>
          <div className="stat-content">
            <h3>Téléchargements</h3>
            <p className="stat-number">1,234</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/products')}>
          Gérer mes produits
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard/orders')}>
          Voir les commandes
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard/analytics')}>
          Analytics
        </button>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="admin-dashboard">
      <h2>Dashboard Administrateur</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Utilisateurs totaux</h3>
            <p className="stat-number">1,234</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Produits totaux</h3>
            <p className="stat-number">567</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Revenus totaux</h3>
            <p className="stat-number">€12,345</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Commandes</h3>
            <p className="stat-number">890</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
          Gérer les utilisateurs
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/admin/products')}>
          Modérer les produits
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/admin/analytics')}>
          Analytics globales
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return isAdmin ? renderAdminDashboard() : (isSeller ? renderSellerDashboard() : renderOverview());
      case 'products':
        return <div>Gestion des produits</div>;
      case 'orders':
        return <div>Historique des commandes</div>;
      case 'profile':
        return <div>Profil utilisateur</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Bienvenue, {user.firstName} {user.lastName}</p>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-sidebar">
            <nav className="dashboard-nav">
              <button
                className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Vue d'ensemble
              </button>

              {(isSeller || isAdmin) && (
                <button
                  className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  📦 Produits
                </button>
              )}

              <button
                className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                🛒 Commandes
              </button>

              <button
                className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Profil
              </button>
            </nav>
          </div>

          <div className="dashboard-main">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
