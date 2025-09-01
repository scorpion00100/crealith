import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Order } from '@/components/ui/OrderCard';

export const useOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: [] as string[],
    dateRange: { start: '', end: '' },
    search: ''
  });

  // Mock data - à remplacer par l'API réelle
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      totalAmount: 29.99,
      status: 'PAID',
      createdAt: '2024-01-15T10:30:00Z',
      items: [
        {
          id: '1',
          product: {
            id: 'prod-1',
            title: 'Template WordPress Premium',
            thumbnailUrl: 'https://via.placeholder.com/300x200?text=Template+WordPress',
            price: 29.99,
            fileType: 'zip'
          },
          quantity: 1,
          price: 29.99,
          downloadCount: 2,
          maxDownloads: 5,
          canDownload: true
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      totalAmount: 12.99,
      status: 'PAID',
      createdAt: '2024-01-10T14:20:00Z',
      items: [
        {
          id: '2',
          product: {
            id: 'prod-2',
            title: 'Pack d\'icônes SVG',
            thumbnailUrl: 'https://via.placeholder.com/300x200?text=Pack+Icons',
            price: 12.99,
            fileType: 'svg'
          },
          quantity: 1,
          price: 12.99,
          downloadCount: 1,
          maxDownloads: 5,
          canDownload: true
        }
      ]
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      totalAmount: 19.99,
      status: 'PENDING',
      createdAt: '2024-01-05T09:15:00Z',
      items: [
        {
          id: '3',
          product: {
            id: 'prod-3',
            title: 'E-book Marketing Digital',
            thumbnailUrl: 'https://via.placeholder.com/300x200?text=E-book+Marketing',
            price: 19.99,
            fileType: 'pdf'
          },
          quantity: 1,
          price: 19.99,
          downloadCount: 0,
          maxDownloads: 5,
          canDownload: false
        }
      ]
    }
  ];

  const fetchOrders = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrer les commandes selon les critères
      let filteredOrders = mockOrders;

      if (filters.status.length > 0) {
        filteredOrders = filteredOrders.filter(order => 
          filters.status.includes(order.status)
        );
      }

      if (filters.search) {
        filteredOrders = filteredOrders.filter(order =>
          order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.items.some(item => 
            item.product.title.toLowerCase().includes(filters.search.toLowerCase())
          )
        );
      }

      if (filters.dateRange.start || filters.dateRange.end) {
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
          const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

          if (startDate && orderDate < startDate) return false;
          if (endDate && orderDate > endDate) return false;
          return true;
        });
      }

      setOrders(filteredOrders);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadProduct = async (productId: string) => {
    try {
      // Simuler un téléchargement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour le compteur de téléchargements
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          items: order.items.map(item => 
            item.product.id === productId 
              ? { ...item, downloadCount: item.downloadCount + 1 }
              : item
          )
        }))
      );

      return { success: true, message: 'Téléchargement réussi' };
    } catch (err) {
      return { success: false, message: 'Erreur lors du téléchargement' };
    }
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const paidOrders = orders.filter(order => order.status === 'PAID').length;
    const totalDownloads = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.downloadCount, 0), 0
    );

    return {
      totalOrders,
      totalSpent,
      paidOrders,
      totalDownloads,
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
    };
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, user, filters]);

  return {
    orders,
    loading,
    error,
    filters,
    setFilters,
    downloadProduct,
    getOrderStats,
    refetch: fetchOrders
  };
};
