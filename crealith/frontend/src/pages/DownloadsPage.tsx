import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { downloadService } from '@/services/download.service';
import { orderService } from '@/services/order.service';
import { Download, Eye, Calendar, Package } from 'lucide-react';

interface DownloadItem {
    id: string;
    title: string;
    thumbnailUrl?: string;
    productId: string;
    purchasedAt: string;
}

export const DownloadsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [items, setItems] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Simple approach: fetch orders and flatten paid items as downloads
                const orders = await orderService.getOrders();
                const paidOrders = orders.filter((o: any) => o.status === 'PAID');
                const flattened: DownloadItem[] = [];
                for (const order of paidOrders) {
                    const orderItems = (order as any).items || [];
                    for (const it of orderItems) {
                        if (it?.product) {
                            flattened.push({
                                id: it.id,
                                title: it.product.title,
                                thumbnailUrl: it.product.thumbnailUrl || it.product.image,
                                productId: it.product.id,
                                purchasedAt: order.createdAt as any
                            });
                        }
                    }
                }
                if (mounted) {
                    setItems(flattened);
                }
            } catch (e: any) {
                setError(e?.message || 'Erreur lors du chargement des téléchargements');
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleDownload = async (productId: string) => {
        try {
            const res = await downloadService.generateDownloadUrl(productId);
            const url = (res as any)?.data?.url || (res as any)?.url || res?.url;
            if (url) {
                window.open(url, '_blank');
            } else {
                throw new Error('URL de téléchargement indisponible');
            }
        } catch (e: any) {
            dispatch(addNotification({ type: 'error', message: e?.message || 'Téléchargement impossible', duration: 4000 }));
        }
    };

    return (
        <div className="min-h-screen bg-background-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-earth-900 mb-2">Mes téléchargements</h1>
                        <p className="text-earth-600">Accédez à tous vos produits achetés</p>
                    </div>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Package className="w-4 h-4" />
                        Explorer le catalogue
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        <span className="ml-3 text-earth-600">Chargement de vos téléchargements...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center">
                            <div className="text-red-600 font-medium">Erreur de chargement</div>
                        </div>
                        <p className="text-red-600 mt-1">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && items.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-earth-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-earth-900 mb-2">Aucun téléchargement disponible</h3>
                        <p className="text-earth-600 mb-6">Vous n'avez pas encore acheté de produits numériques.</p>
                        <button
                            onClick={() => navigate('/catalog')}
                            className="btn btn-primary"
                        >
                            Découvrir le catalogue
                        </button>
                    </div>
                )}

                {/* Downloads Grid */}
                {!isLoading && items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-white border border-earth-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={item.thumbnailUrl || 'https://via.placeholder.com/120x90?text=Preview'}
                                        alt={item.title}
                                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-earth-900 line-clamp-2 mb-2">{item.title}</h3>
                                        <div className="flex items-center text-sm text-earth-500 mb-4">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Acheté le {new Date(item.purchasedAt as any).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-primary btn-sm flex items-center gap-2"
                                                onClick={() => handleDownload(item.productId)}
                                            >
                                                <Download className="w-4 h-4" />
                                                Télécharger
                                            </button>
                                            <button
                                                className="btn btn-outline btn-sm flex items-center gap-2"
                                                onClick={() => navigate(`/product/${item.productId}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                                Voir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {!isLoading && items.length > 0 && (
                    <div className="mt-8 bg-white border border-earth-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-earth-900">Résumé de vos achats</h3>
                                <p className="text-earth-600 text-sm">Total: {items.length} produit{items.length > 1 ? 's' : ''} acheté{items.length > 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary-600">{items.length}</div>
                                <div className="text-sm text-earth-500">Téléchargements</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadsPage;


