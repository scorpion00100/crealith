import React from 'react';

interface SellerStatsProps {
  stats?: {
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
    averageRating: number;
    monthlyGrowth: number;
  };
  period?: 'week' | 'month' | 'year';
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

export const SellerStats: React.FC<SellerStatsProps> = ({
  stats = {
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    averageRating: 0,
    monthlyGrowth: 0
  },
  period = 'month',
  onPeriodChange
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'success';
    if (value < 0) return 'danger';
    return 'neutral';
  };

  return (
    <div className="seller-stats">
      {/* Cartes de statistiques principales */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-title">Revenus totaux</div>
        </div>
        <div className="stat-card-value">{formatCurrency(stats.totalRevenue)}</div>
        <div className={`stat-card-change ${getGrowthColor(stats.monthlyGrowth)}`}>
          <span className="stat-card-change-icon">
            {stats.monthlyGrowth > 0 ? '↗' : stats.monthlyGrowth < 0 ? '↘' : '→'}
          </span>
          {formatPercentage(stats.monthlyGrowth)} ce mois
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-title">Ventes totales</div>
        </div>
        <div className="stat-card-value">{stats.totalSales}</div>
        <div className="stat-card-change neutral">
          <span className="stat-card-change-icon">📈</span>
          +12% ce mois
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon">🛍️</div>
          <div className="stat-card-title">Produits actifs</div>
        </div>
        <div className="stat-card-value">{stats.totalProducts}</div>
        <div className="stat-card-change success">
          <span className="stat-card-change-icon">↗</span>
          +3 nouveaux
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon">⭐</div>
          <div className="stat-card-title">Note moyenne</div>
        </div>
        <div className="stat-card-value">{stats.averageRating.toFixed(1)}</div>
        <div className="stat-card-change success">
          <span className="stat-card-change-icon">↗</span>
          +0.2 ce mois
        </div>
      </div>

      {/* Graphiques */}
      <div className="stats-charts">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Évolution des ventes</h3>
            <div className="chart-actions">
              <div className="chart-period-selector">
                <button
                  className={`chart-period-option ${period === 'week' ? 'active' : ''}`}
                  onClick={() => onPeriodChange?.('week')}
                >
                  7j
                </button>
                <button
                  className={`chart-period-option ${period === 'month' ? 'active' : ''}`}
                  onClick={() => onPeriodChange?.('month')}
                >
                  30j
                </button>
                <button
                  className={`chart-period-option ${period === 'year' ? 'active' : ''}`}
                  onClick={() => onPeriodChange?.('year')}
                >
                  1an
                </button>
              </div>
            </div>
          </div>
          <div className="main-chart">
            <div className="chart-placeholder">
              Graphique des ventes - {period}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Répartition des ventes</h3>
          </div>
          <div className="donut-chart">
            <div className="donut-chart-placeholder">
              <div className="donut-chart-center">
                <div className="donut-chart-value">{stats.totalSales}</div>
                <div className="donut-chart-label">Ventes</div>
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color primary"></div>
              <div className="legend-label">Templates</div>
              <div className="legend-value">45%</div>
            </div>
            <div className="legend-item">
              <div className="legend-color success"></div>
              <div className="legend-label">Graphiques</div>
              <div className="legend-value">30%</div>
            </div>
            <div className="legend-item">
              <div className="legend-color warning"></div>
              <div className="legend-label">Code</div>
              <div className="legend-value">25%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de performance */}
      <div className="performance-indicators">
        <div className="performance-indicator">
          <div className="performance-icon success">📈</div>
          <div className="performance-content">
            <div className="performance-label">Taux de conversion</div>
            <div className="performance-value">3.2%</div>
          </div>
        </div>

        <div className="performance-indicator">
          <div className="performance-icon info">⏱️</div>
          <div className="performance-content">
            <div className="performance-label">Temps de réponse</div>
            <div className="performance-value">2.4h</div>
          </div>
        </div>

        <div className="performance-indicator">
          <div className="performance-icon warning">🔄</div>
          <div className="performance-content">
            <div className="performance-label">Taux de retour</div>
            <div className="performance-value">1.8%</div>
          </div>
        </div>

        <div className="performance-indicator">
          <div className="performance-icon success">👥</div>
          <div className="performance-content">
            <div className="performance-label">Clients fidèles</div>
            <div className="performance-value">67%</div>
          </div>
        </div>
      </div>

      {/* Tableau des statistiques détaillées */}
      <div className="stats-table-container">
        <div className="stats-table-header">
          <h3 className="stats-table-title">Produits les plus vendus</h3>
          <p className="stats-table-subtitle">Top 10 des produits par ventes</p>
        </div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Ventes</th>
              <th>Revenus</th>
              <th>Note</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Template WordPress Premium</td>
              <td>156</td>
              <td>{formatCurrency(2340)}</td>
              <td>4.8 ⭐</td>
              <td><span className="badge success">Actif</span></td>
            </tr>
            <tr>
              <td>Pack Icônes Modernes</td>
              <td>89</td>
              <td>{formatCurrency(890)}</td>
              <td>4.9 ⭐</td>
              <td><span className="badge success">Actif</span></td>
            </tr>
            <tr>
              <td>E-book Marketing Digital</td>
              <td>67</td>
              <td>{formatCurrency(1340)}</td>
              <td>4.7 ⭐</td>
              <td><span className="badge success">Actif</span></td>
            </tr>
            <tr>
              <td>Script PHP E-commerce</td>
              <td>45</td>
              <td>{formatCurrency(675)}</td>
              <td>4.6 ⭐</td>
              <td><span className="badge warning">En pause</span></td>
            </tr>
            <tr>
              <td>Template Figma UI Kit</td>
              <td>34</td>
              <td>{formatCurrency(510)}</td>
              <td>4.8 ⭐</td>
              <td><span className="badge success">Actif</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
