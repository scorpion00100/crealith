import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsData, ChartData } from '@/components/ui/AnalyticsChart';
import { analyticsService } from '@/services/analytics.service';

export const useAnalytics = (variant: 'buyer' | 'seller' = 'buyer') => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data pour les acheteurs
  const mockBuyerData: AnalyticsData = {
    totalRevenue: 0,
    totalSales: 12,
    totalDownloads: 28,
    averageRating: 4.7,
    revenueChange: 0,
    salesChange: 15.2,
    downloadsChange: 22.1,
    ratingChange: 1.8,
    revenueData: [
      { label: 'Jan', value: 0 },
      { label: 'Fév', value: 0 },
      { label: 'Mar', value: 0 },
      { label: 'Avr', value: 0 },
      { label: 'Mai', value: 0 },
      { label: 'Jun', value: 0 }
    ],
    salesData: [
      { label: 'Templates', value: 8 },
      { label: 'Graphiques', value: 3 },
      { label: 'E-books', value: 1 }
    ],
    topProducts: [
      { label: 'Template WordPress', value: 3 },
      { label: 'Pack Icons SVG', value: 2 },
      { label: 'E-book Marketing', value: 1 },
      { label: 'Template E-commerce', value: 2 },
      { label: 'Pack Illustrations', value: 1 }
    ]
  };

  const mapSellerAnalyticsToChart = (seller: any): AnalyticsData => {
    const revenueData: ChartData[] = (seller.salesByMonth || []).map((m: any) => ({
      label: m.month,
      value: Math.round(m.revenue)
    }));
    const salesData: ChartData[] = (seller.salesByMonth || []).map((m: any) => ({
      label: m.month,
      value: Math.round(m.sales)
    }));

    const topProducts: ChartData[] = (seller.topProducts || []).map((p: any) => ({
      label: p.title,
      value: p.sales
    }));

    return {
      totalRevenue: seller.totalRevenue || 0,
      totalSales: seller.totalSales || 0,
      totalDownloads: seller.totalOrders || 0,
      averageRating: 0,
      revenueChange: 0,
      salesChange: 0,
      downloadsChange: 0,
      ratingChange: 0,
      revenueData,
      salesData,
      topProducts
    };
  };

  const fetchAnalytics = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      if (variant === 'seller') {
        const seller = await analyticsService.getSellerAnalytics(period);
        setData(mapSellerAnalyticsToChart(seller));
      } else {
        setData(mockBuyerData);
      }
    } catch (err) {
      setError('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const getRevenueBreakdown = (): ChartData[] => {
    if (!data) return [];
    return data.salesData.length > 0 ? data.salesData : [
      { label: 'Templates', value: 60 },
      { label: 'Graphiques', value: 25 },
      { label: 'E-books', value: 10 },
      { label: 'Autres', value: 5 }
    ];
  };

  const getSalesTrend = (): ChartData[] => {
    if (!data) return [];
    return data.revenueData.map(item => ({
      label: item.label,
      value: item.value
    }));
  };

  const getTopCategories = (): ChartData[] => {
    if (!data) return [];
    return data.salesData;
  };

  const getPerformanceMetrics = () => {
    if (!data) return null;
    return {
      conversionRate: variant === 'seller' ? 3.2 : 0,
      averageOrderValue: variant === 'seller' ? (data.totalRevenue / Math.max(1, data.totalSales)) : 0,
      customerSatisfaction: data.averageRating,
      repeatPurchaseRate: variant === 'buyer' ? 45 : 0,
      downloadRate: (data.totalDownloads / Math.max(1, data.totalSales)) * 100
    };
  };

  const exportData = async (format: 'csv' | 'pdf' = 'csv') => {
    if (!data) return;
    try {
      // Placeholder: côté backend, un endpoint d'export peut être ajouté
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: `Données exportées en ${format.toUpperCase()}` };
    } catch (err) {
      return { success: false, message: 'Erreur lors de l\'export' };
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [isAuthenticated, user, period, variant]);

  return {
    data,
    loading,
    error,
    period,
    setPeriod,
    getRevenueBreakdown,
    getSalesTrend,
    getTopCategories,
    getPerformanceMetrics,
    exportData,
    refetch: fetchAnalytics
  };
};
