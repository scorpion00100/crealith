import React from 'react';
import { Download, Eye, Star, DollarSign } from 'lucide-react';
import { Product } from '@/types';

interface ProductStatsProps {
    product: Product;
    formatPrice: (price: number) => string;
}

export const ProductStats: React.FC<ProductStatsProps> = ({ product, formatPrice }) => {
    const stats = [
        {
            icon: DollarSign,
            label: 'Prix',
            value: formatPrice(parseFloat(product.price)),
            color: 'text-green-400'
        },
        {
            icon: Download,
            label: 'Téléchargements',
            value: product.downloadsCount || 0,
            color: 'text-blue-400'
        },
        {
            icon: Eye,
            label: 'Vues',
            value: product.viewsCount || 0,
            color: 'text-purple-400'
        },
        {
            icon: Star,
            label: 'Note moyenne',
            value: product.rating ? `${product.rating.toFixed(1)}/5` : 'N/A',
            color: 'text-yellow-400'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-gray-700 ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

