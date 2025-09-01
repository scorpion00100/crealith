import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AnalyticsData, ChartData } from '@/components/ui/AnalyticsChart';

export const useAnalytics = (variant: 'buyer' | 'seller' = 'buyer') => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data pour les vendeurs
  const mockSellerData: AnalyticsData = {
    totalRevenue: 1247.85,
    totalSales: 45,
    totalDownloads: 127,
    averageRating: 4.6,
    revenueChange: 12.5,
    salesChange: 8.3,
    downloadsChange: 15.7,
    ratingChange: 2.1,
    revenueData: [
      { label: 'Jan', value: 1200 },
      { label: 'Fév', value: 1400 },
      { label: 'Mar', value: 1100 },
      { label: 'Avr', value: 1600 },
      { label: 'Mai', value: 1800 },
      { label: 'Jun', value: 2200 }
    ],
    salesData: [
      { label: 'Templates', value: 25 },
      { label: 'Graphiques', value: 15 },
      { label: 'E-books', value: 5 }
    ],
    topProducts: [
      { label: 'Template WordPress', value: 15 },
      { label: 'Pack Icons SVG', value: 12 },
      { label: 'E-book Marketing', value: 8 },
      { label: 'Template E-commerce', value: 6 },
      { label: 'Pack Illustrations', value: 4 }
    ]
  };

  // Mock data pour les acheteurs
  const mockBuyerData: AnalyticsData = {
    totalRevenue: 0, // Les acheteurs ne génèrent pas de revenus
    totalSales: 12, // Nombre d'achats
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

  const fetchAnalytics = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Retourner les données selon le variant
      const analyticsData = variant === 'seller' ? mockSellerData : mockBuyerData;
      
      // Ajuster les données selon la période
      const adjustedData = adjustDataForPeriod(analyticsData, period);
      
      setData(adjustedData);
    } catch (err) {
      setError('Erreur lors du chargement des analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const adjustDataForPeriod = (data: AnalyticsData, period: 'week' | 'month' | 'year'): AnalyticsData => {
    const multiplier = period === 'week' ? 0.25 : period === 'month' ? 1 : 12;
    
    return {
      ...data,
      totalRevenue: data.totalRevenue * multiplier,
      totalSales: Math.round(data.totalSales * multiplier),
      totalDownloads: Math.round(data.totalDownloads * multiplier),
      revenueData: data.revenueData.map(item => ({
        ...item,
        value: Math.round(item.value * multiplier)
      })),
      topProducts: data.topProducts.map(item => ({
        ...item,
        value: Math.round(item.value * multiplier)
      }))
    };
  };

  const getRevenueBreakdown = (): ChartData[] => {
    if (!data) return [];
    
    return [
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
      conversionRate: variant === 'seller' ? 3.2 : 0, // % de visiteurs qui achètent
      averageOrderValue: variant === 'seller' ? data.totalRevenue / data.totalSales : 0,
      customerSatisfaction: data.averageRating,
      repeatPurchaseRate: variant === 'buyer' ? 45 : 0, // % de clients qui rachètent
      downloadRate: (data.totalDownloads / data.totalSales) * 100
    };
  };

  const exportData = async (format: 'csv' | 'pdf' = 'csv') => {
    if (!data) return;
    
    try {
      // Simuler l'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (format === 'csv') {
        // Logique d'export CSV
        console.log('Exporting CSV data...');
      } else {
        // Logique d'export PDF
        console.log('Exporting PDF data...');
      }
      
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
