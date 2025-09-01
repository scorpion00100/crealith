import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, Star, Calendar, User, Tag, Eye } from 'lucide-react';

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    title: string;
    thumbnailUrl: string;
    price: number;
    fileType: string;
  };
  quantity: number;
  price: number;
  downloadCount: number;
  maxDownloads: number;
  canDownload: boolean;
  downloadUrl?: string;
}

interface OrderCardProps {
  order: Order;
  onDownload: (productId: string) => void;
  onReview: (productId: string) => void;
  onViewProduct: (productId: string) => void;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DELIVERED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'PAID':
      return 'Payé';
    case 'PENDING':
      return 'En attente';
    case 'DELIVERED':
      return 'Livré';
    case 'CANCELLED':
      return 'Annulé';
    case 'REFUNDED':
      return 'Remboursé';
    default:
      return status;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onDownload,
  onReview,
  onViewProduct
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Commande #{order.orderNumber}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">€{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-6">
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={item.product.thumbnailUrl}
                  alt={item.product.title}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.product.fileType.toUpperCase()} • {item.quantity} article{item.quantity > 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>€{item.price.toFixed(2)}</span>
                      <span>•</span>
                      <span>{item.downloadCount}/{item.maxDownloads} téléchargements</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onViewProduct(item.product.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Voir le produit"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {item.canDownload && item.downloadCount < item.maxDownloads && (
                      <button
                        onClick={() => onDownload(item.product.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Télécharger</span>
                      </button>
                    )}

                    {item.downloadCount >= item.maxDownloads && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                        Limite atteinte
                      </span>
                    )}

                    <button
                      onClick={() => onReview(item.product.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Star className="w-3 h-3" />
                      <span>Noter</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
