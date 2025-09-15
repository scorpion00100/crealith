import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Vous devez être connecté pour accéder au dashboard',
      }));
      navigate('/login?redirect=/dashboard');
      return;
    }

    // Redirection automatique vers les interfaces spécialisées
    if (user?.role === 'SELLER') {
      // Rediriger automatiquement vers le dashboard vendeur
      navigate('/seller-dashboard');
    } else if (user?.role === 'BUYER') {
      // Rediriger automatiquement vers le dashboard acheteur
      navigate('/buyer-dashboard');
    }
  }, [isAuthenticated, navigate, dispatch, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const getUserInitials = () => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleName = () => {
    switch (user.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'SELLER':
        return 'Vendeur';
      case 'BUYER':
        return 'Acheteur';
      default:
        return 'Utilisateur';
    }
  };

  const handleLogout = () => {
    logout();
    dispatch(addNotification({
      type: 'success',
      message: 'Déconnexion réussie',
    }));
    navigate('/');
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <h2 className="dashboard-section-title">Vue d'ensemble</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Statistiques</h3>
              <p className="stat-number">En cours</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>Commandes</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>Évaluations</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Performance</h3>
              <p className="stat-number">N/A</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => navigate('/catalog')}>
          🛍️ Parcourir les produits
        </button>
        <button className="btn btn-outline" onClick={() => setActiveTab('profile')}>
          👤 Mon profil
        </button>

        {/* Boutons d'accès aux nouvelles interfaces */}
        {user.role === 'BUYER' && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/buyer-dashboard')}
            style={{ marginTop: '1rem' }}
          >
            🛒 Interface Acheteur Avancée
          </button>
        )}

        {user.role === 'SELLER' && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/seller-dashboard')}
            style={{ marginTop: '1rem' }}
          >
            📊 Interface Vendeur Avancée
          </button>
        )}
      </div>
    </div>
  );

  const renderSellerDashboard = () => (
    <div className="seller-dashboard">
      <h2 className="dashboard-section-title">Dashboard Vendeur</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Revenus totaux</h3>
              <p className="stat-number">€0.00</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Produits vendus</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>Note moyenne</h3>
              <p className="stat-number">0.0/5</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">📥</div>
            <div className="stat-info">
              <h3>Téléchargements</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => setActiveTab('products')}>
          📦 Gérer mes produits
        </button>
        <button className="btn btn-outline" onClick={() => setActiveTab('analytics')}>
          📊 Analytics détaillées
        </button>
        <button className="btn btn-outline" onClick={() => setActiveTab('orders')}>
          📋 Commandes récentes
        </button>

        {/* Bouton vers l'interface vendeur avancée */}
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/seller-dashboard')}
          style={{ marginTop: '1rem' }}
        >
          🚀 Interface Vendeur Complète
        </button>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="admin-dashboard">
      <h2 className="dashboard-section-title">Dashboard Administrateur</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Utilisateurs</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Produits</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Revenus totaux</h3>
              <p className="stat-number">€0.00</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Analytics</h3>
              <p className="stat-number">N/A</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => setActiveTab('users')}>
          👥 Gérer les utilisateurs
        </button>
        <button className="btn btn-outline" onClick={() => setActiveTab('products')}>
          📦 Gérer les produits
        </button>
        <button className="btn btn-outline" onClick={() => setActiveTab('analytics')}>
          📊 Analytics globales
        </button>
      </div>
    </div>
  );

  const renderProductsSection = () => (
    <div className="products-section">
      <div className="products-header">
        <h3 className="products-title">Mes Produits</h3>
        <a href="/seller/products/new" className="add-product-btn">
          ➕ Ajouter un produit
        </a>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Ventes</th>
              <th>Revenus</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="product-name">Aucun produit</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrdersSection = () => (
    <div className="orders-section">
      <div className="orders-header">
        <h3 className="orders-title">Historique des Commandes</h3>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Produit</th>
              <th>Prix</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="product-name">Aucune commande</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfileSection = () => (
    <div className="profile-section">
      <div className="profile-header">
        <h3 className="profile-title">Mon Profil</h3>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: '600px' }}>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h3>Informations personnelles</h3>
              <p className="stat-number">{user.firstName} {user.lastName}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon">📧</div>
            <div className="stat-info">
              <h3>Email</h3>
              <p className="stat-number">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button className="btn btn-primary">
            ✏️ Modifier le profil
          </button>
          <button className="btn btn-outline">
            🔒 Changer le mot de passe
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'products':
        return renderProductsSection();
      case 'orders':
        return renderOrdersSection();
      case 'profile':
        return renderProfileSection();
      case 'analytics':
        return (
          <div className="analytics-section">
            <div className="analytics-header">
              <h3 className="analytics-title">Analytics</h3>
            </div>
            <p>Analytics en cours de développement...</p>
          </div>
        );
      default:
        if (user.role === 'ADMIN') {
          return renderAdminDashboard();
        } else if (user.role === 'SELLER') {
          return renderSellerDashboard();
        } else {
          return renderOverview();
        }
    }
  };

  const getNavTabs = () => {
    const baseTabs = [
      { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
      { id: 'profile', label: 'Mon Profil', icon: '👤' },
    ];

    if (user.role === 'SELLER') {
      return [
        ...baseTabs,
        { id: 'products', label: 'Mes Produits', icon: '📦' },
        { id: 'orders', label: 'Commandes', icon: '🛒' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        ...baseTabs,
        { id: 'users', label: 'Utilisateurs', icon: '👥' },
        { id: 'products', label: 'Produits', icon: '📦' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
      ];
    }

    return baseTabs;
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome">
            <div className="dashboard-welcome-text">
              <h1>Dashboard</h1>
              <p>Bienvenue sur votre espace personnel</p>
            </div>
            <div className="dashboard-user-info">
              <div className="dashboard-user-avatar">
                {getUserInitials()}
              </div>
              <div className="dashboard-user-details">
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
                <div className="dashboard-role-badge">
                  {getRoleName()}
                </div>
              </div>
              <div className="dashboard-user-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid #e5e7eb',
                    color: '#6b7280',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification des nouvelles interfaces */}
      <div className="dashboard-notification" style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        color: 'white',
        padding: '1rem',
        margin: '1rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>🎉 Nouvelles Interfaces Disponibles !</h3>
        <p style={{ margin: '0 0 1rem 0' }}>
          Découvrez nos interfaces avancées spécialement conçues pour votre rôle
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user.role === 'BUYER' && (
            <button
              className="btn btn-light"
              onClick={() => navigate('/buyer-dashboard')}
              style={{
                background: 'white',
                color: '#6366f1',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🛒 Interface Acheteur Avancée
            </button>
          )}
          {user.role === 'SELLER' && (
            <button
              className="btn btn-light"
              onClick={() => navigate('/seller-dashboard')}
              style={{
                background: 'white',
                color: '#6366f1',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📊 Interface Vendeur Avancée
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-layout">
          <div className="dashboard-sidebar">
            <nav className="dashboard-nav">
              {getNavTabs().map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>
                    <div className="nav-tab-icon">{tab.icon}</div>
                    {tab.label}
                  </span>
                </button>
              ))}
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
