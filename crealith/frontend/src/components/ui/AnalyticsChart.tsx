import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Download,
  Star,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalSales: number;
  totalDownloads: number;
  averageRating: number;
  revenueChange: number;
  salesChange: number;
  downloadsChange: number;
  ratingChange: number;
  revenueData: ChartData[];
  salesData: ChartData[];
  topProducts: ChartData[];
}

interface AnalyticsChartProps {
  data: AnalyticsData;
  period?: 'week' | 'month' | 'year';
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <div className="flex items-center mt-4">
      {change >= 0 ? (
        <TrendingUp className="w-4 h-4 text-green-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-500" />
      )}
      <span className={`text-sm font-medium ml-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
      </span>
      <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
    </div>
  </div>
);

const SimpleBarChart: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm text-gray-500">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SimpleLineChart: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} 200`}>
        {/* Grid lines */}
        {[0, 50, 100, 150, 200].map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={y}
            x2={data.length * 60}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Data line */}
        <polyline
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          points={data.map((item, index) =>
            `${index * 60 + 30},${200 - (item.value / Math.max(...data.map(d => d.value))) * 180}`
          ).join(' ')}
        />

        {/* Data points */}
        {data.map((item, index) => (
          <circle
            key={index}
            cx={index * 60 + 30}
            cy={200 - (item.value / Math.max(...data.map(d => d.value))) * 180}
            r="4"
            fill="#3b82f6"
          />
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index} className="text-center flex-1">{item.label}</span>
        ))}
      </div>
    </div>
  </div>
);

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  period = 'month',
  onPeriodChange
}) => {
  return (
    <div className="space-y-6">
      {/* Period Selector */}
      {onPeriodChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Période :</span>
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus totaux"
          value={`€${data.totalRevenue.toFixed(2)}`}
          change={data.revenueChange}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Ventes"
          value={data.totalSales}
          change={data.salesChange}
          icon={<ShoppingBag className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Téléchargements"
          value={data.totalDownloads}
          change={data.downloadsChange}
          icon={<Download className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Note moyenne"
          value={data.averageRating.toFixed(1)}
          change={data.ratingChange}
          icon={<Star className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          data={data.revenueData}
          title="Évolution des revenus"
        />
        <SimpleBarChart
          data={data.topProducts}
          title="Produits les plus vendus"
        />
      </div>

      {/* Sales Distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des ventes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.salesData.map((item, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
