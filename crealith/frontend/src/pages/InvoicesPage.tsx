import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { orderService } from '@/services/order.service';
import { Download, Eye, Calendar, Package, FileText, Euro } from 'lucide-react';

interface InvoiceItem {
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    items: Array<{
        id: string;
        title: string;
        price: number;
        quantity: number;
    }>;
}

export const InvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const orders = await orderService.getOrders();
                const invoiceItems: InvoiceItem[] = orders.map((order: any) => ({
                    id: order.id,
                    orderNumber: order.orderNumber || `#${order.id.slice(-8)}`,
                    amount: parseFloat(order.totalAmount || 0),
                    status: order.status,
                    createdAt: order.createdAt,
                    items: (order.items || []).map((item: any) => ({
                        id: item.id,
                        title: item.product?.title || 'Produit',
                        price: parseFloat(item.product?.price || 0),
                        quantity: item.quantity || 1
                    }))
                }));

                if (mounted) {
                    setInvoices(invoiceItems);
                }
            } catch (e: any) {
                setError(e?.message || 'Erreur lors du chargement des factures');
                dispatch(addNotification({
                    type: 'error',
                    message: 'Erreur lors du chargement des factures',
                    duration: 4000
                }));
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        })();
        return () => { mounted = false; };
    }, [dispatch]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'completed':
                return 'text-success-400 bg-success-500/15';
            case 'pending':
                return 'text-yellow-400 bg-yellow-500/15';
            case 'failed':
            case 'cancelled':
                return 'text-error-400 bg-error-500/15';
            default:
                return 'text-text-400 bg-background-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'completed':
                return 'Payé';
            case 'pending':
                return 'En attente';
            case 'failed':
                return 'Échoué';
            case 'cancelled':
                return 'Annulé';
            default:
                return status;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-text-400">Chargement de vos factures...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="text-error-400 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-text-100 mb-2">Erreur de chargement</h2>
                        <p className="text-text-400 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-100 mb-2">Mes factures</h1>
                    <p className="text-text-400">Consultez l'historique de vos achats et téléchargez vos factures</p>
                </div>

                {invoices.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-text-400 text-6xl mb-4">📄</div>
                        <h2 className="text-2xl font-bold text-text-100 mb-2">Aucune facture</h2>
                        <p className="text-text-400 mb-6">Vous n'avez pas encore effectué d'achats</p>
                        <button
                            onClick={() => navigate('/catalog')}
                            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                            Découvrir nos produits
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {invoices.map((invoice) => (
                            <div key={invoice.id} className="bg-background-800 rounded-2xl border border-background-700 p-6 hover:border-primary-500/30 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary-500/15 rounded-xl">
                                            <FileText className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-100">
                                                {invoice.orderNumber}
                                            </h3>
                                            <p className="text-sm text-text-400">
                                                {formatDate(invoice.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-text-100 mb-1">
                                            {formatPrice(invoice.amount)}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                                            {getStatusText(invoice.status)}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-text-400 mb-3">Articles achetés :</h4>
                                    <div className="space-y-2">
                                        {invoice.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-background-700 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Package className="w-4 h-4 text-text-400" />
                                                    <span className="text-text-200">{item.title}</span>
                                                    <span className="text-sm text-text-400">x{item.quantity}</span>
                                                </div>
                                                <span className="text-text-100 font-medium">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-background-700">
                                    <button
                                        onClick={() => {
                                            // TODO: Implémenter le téléchargement de facture PDF
                                            dispatch(addNotification({
                                                type: 'info',
                                                message: 'Fonctionnalité de téléchargement PDF à venir',
                                                duration: 3000
                                            }));
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger PDF
                                    </button>
                                    <button
                                        onClick={() => navigate(`/downloads?order=${invoice.id}`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-background-700 hover:bg-background-600 text-text-200 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Voir les téléchargements
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoicesPage;