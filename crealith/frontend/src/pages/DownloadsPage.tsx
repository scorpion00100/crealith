import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { downloadService } from '@/services/download.service';
import { orderService } from '@/services/order.service';
import {
    Download,
    Eye,
    Calendar,
    Package,
    CheckCircle,
    Clock,
    Star,
    ArrowLeft,
    Sparkles,
    Shield,
    Zap,
    Heart,
    Award,
    Users,
    Gift
} from 'lucide-react';

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
            logger.log('Tentative de téléchargement pour le produit:', productId);
            const res = await downloadService.generateDownloadUrl(productId);
            logger.log('Réponse du service:', res);

            if (res?.url) {
                logger.log('Ouverture de l\'URL:', res.url);
                window.open(res.url, '_blank');
                dispatch(addNotification({
                    type: 'success',
                    message: 'Téléchargement lancé !',
                    duration: 3000
                }));
            } else {
                throw new Error('URL de téléchargement non reçue');
            }
        } catch (e: any) {
            logger.error('Erreur de téléchargement:', e);
            dispatch(addNotification({
                type: 'error',
                message: e?.message || 'Téléchargement impossible',
                duration: 4000
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Retour au dashboard</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <span className="font-semibold">Crealith</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <Download className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Mes téléchargements
                    </h1>
                    <p className="text-xl text-gray-400 mb-8">
                        Accédez à tous vos produits achetés et téléchargez-les instantanément
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-lg">Chargement de vos téléchargements...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">!</span>
                            </div>
                            <div>
                                <h3 className="text-red-400 font-semibold">Erreur de chargement</h3>
                                <p className="text-red-300 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && items.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                            <Package className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Aucun téléchargement disponible</h3>
                        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                            Vous n'avez pas encore acheté de produits numériques. Découvrez notre catalogue et trouvez des créations incroyables !
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/catalog')}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                            >
                                <Gift className="w-5 h-5" />
                                Découvrir le catalogue
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border border-gray-700"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Retour au dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* Downloads Grid */}
                {!isLoading && items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map(item => (
                            <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-indigo-500/50 group">
                                <div className="flex flex-col h-full">
                                    {/* Product Image */}
                                    <div className="relative mb-4">
                                        <img
                                            src={item.thumbnailUrl || 'https://via.placeholder.com/300x200?text=Preview'}
                                            alt={item.title}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Acheté
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="font-bold text-white text-lg mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                            {item.title}
                                        </h3>

                                        <div className="flex items-center text-sm text-gray-400 mb-4">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Acheté le {new Date(item.purchasedAt as any).toLocaleDateString('fr-FR')}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-auto">
                                            <button
                                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                                onClick={() => handleDownload(item.productId)}
                                            >
                                                <Download className="w-4 h-4" />
                                                Télécharger
                                            </button>
                                            <button
                                                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-600"
                                                onClick={() => navigate(`/product/${item.productId}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats & Summary */}
                {!isLoading && items.length > 0 && (
                    <div className="mt-12">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Résumé de vos achats</h3>
                                    <p className="text-gray-400">
                                        Total: {items.length} produit{items.length > 1 ? 's' : ''} acheté{items.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-indigo-400">{items.length}</div>
                                    <div className="text-gray-400">Téléchargements</div>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-600 rounded-lg">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-white">Accès sécurisé</h4>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Vos fichiers sont protégés et accessibles uniquement à vous
                                </p>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-white">Téléchargement instantané</h4>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Accédez à vos fichiers immédiatement après l'achat
                                </p>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-600 rounded-lg">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-white">Support 24/7</h4>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Notre équipe est là pour vous aider en cas de problème
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadsPage;


