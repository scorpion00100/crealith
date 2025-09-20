import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItemAsync, removeFromCartAsync, clearCartAsync } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    Trash2,
    Minus,
    Plus,
    ShoppingCart,
    ArrowLeft,
    CreditCard,
    Shield,
    Download,
    Star,
    Tag,
    Heart,
    Sparkles,
    CheckCircle,
    Gift
} from 'lucide-react';

export const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAuth();

    const { items, totalAmount, subtotal, platformFee, isLoading } = useAppSelector(state => state.cart);

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour voir votre panier',
                duration: 4000
            }));
            navigate('/login?redirect=/cart');
            return;
        }

        dispatch(fetchCart());
    }, [dispatch, isAuthenticated, navigate]);

    const handleUpdateQuantity = async (id: string, quantity: number) => {
        try {
            await dispatch(updateCartItemAsync({ id, quantity })).unwrap();
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors de la mise à jour de la quantité',
                duration: 4000
            }));
        }
    };

    const handleRemoveItem = async (id: string) => {
        try {
            await dispatch(removeFromCartAsync(id)).unwrap();
            dispatch(addNotification({
                type: 'success',
                message: 'Produit retiré du panier',
                duration: 3000
            }));
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors de la suppression',
                duration: 4000
            }));
        }
    };

    const handleClearCart = async () => {
        try {
            await dispatch(clearCartAsync()).unwrap();
            dispatch(addNotification({
                type: 'success',
                message: 'Panier vidé',
                duration: 3000
            }));
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors du vidage du panier',
                duration: 4000
            }));
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Votre panier est vide',
                duration: 3000
            }));
            return;
        }
        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/catalog');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
                    <p className="text-gray-400 text-lg font-medium">Chargement du panier...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleContinueShopping}
                                className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                Continuer les achats
                            </button>
                            <div className="h-6 w-px bg-gray-600"></div>
                            <h1 className="text-2xl font-bold text-white">Mon Panier</h1>
                        </div>
                        {items.length > 0 && (
                            <button
                                onClick={handleClearCart}
                                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={18} />
                                Vider le panier
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {items.length === 0 ? (
                    /* Panier vide - Style Etsy */
                    <div className="text-center py-16">
                        <div className="w-32 h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShoppingCart size={64} className="text-primary-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Votre panier est vide</h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                            Découvrez nos créations uniques et commencez votre collection
                        </p>
                        <button
                            onClick={handleContinueShopping}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105"
                        >
                            <Sparkles size={20} />
                            Explorer le catalogue
                        </button>
                    </div>
                ) : (
                    /* Panier avec produits - Layout moderne */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Liste des produits */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <ShoppingCart size={24} className="text-primary-400" />
                                    <h2 className="text-xl font-bold text-white">Produits ({items.length})</h2>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="bg-gray-700 rounded-xl border border-gray-600 p-6 hover:border-primary-500/30 transition-all duration-300">
                                            <div className="flex gap-4">
                                                {/* Image du produit */}
                                                <div className="w-24 h-24 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.product.thumbnailUrl || item.product.image}
                                                        alt={item.product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Détails du produit */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                                                        {item.product.title}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm mb-2">
                                                        par {item.product.user?.firstName || 'Crealith'} {item.product.user?.lastName || 'Design'}
                                                    </p>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {item.product.tags?.slice(0, 3).map((tag, index) => (
                                                            <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full">
                                                                <Tag size={12} />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Prix et quantité */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-right">
                                                            <div className="text-xl font-bold text-white">
                                                                {(parseFloat(item.product.price) * item.quantity).toFixed(2)} €
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                {item.product.price} € / unité
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contrôles de quantité et actions */}
                                                <div className="flex flex-col items-end gap-3">
                                                    {/* Quantité */}
                                                    <div className="flex items-center gap-2 bg-gray-600 rounded-lg p-1">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="w-8 text-center text-white font-semibold">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-500 rounded transition-colors"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Bouton supprimer */}
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Résumé de la commande */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 sticky top-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard size={24} className="text-primary-400" />
                                    <h2 className="text-xl font-bold text-white">Résumé</h2>
                                </div>

                                {/* Détail des prix */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Sous-total</span>
                                        <span className="text-white font-semibold">{subtotal.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Frais de plateforme (5%)</span>
                                        <span className="text-white font-semibold">{platformFee.toFixed(2)} €</span>
                                    </div>
                                    <div className="h-px bg-gray-600"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-2xl font-bold text-primary-400">{totalAmount.toFixed(2)} €</span>
                                    </div>
                                </div>

                                {/* Bouton de checkout */}
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 mb-6"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <CreditCard size={20} />
                                        Procéder au paiement
                                    </div>
                                </button>

                                {/* Informations de sécurité */}
                                <div className="space-y-4">
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield size={16} className="text-green-400" />
                                            <span className="text-green-400 font-semibold text-sm">Paiement sécurisé</span>
                                        </div>
                                        <p className="text-green-300 text-xs">Chiffrement SSL 256-bit</p>
                                    </div>

                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Download size={16} className="text-blue-400" />
                                            <span className="text-blue-400 font-semibold text-sm">Accès immédiat</span>
                                        </div>
                                        <p className="text-blue-300 text-xs">Téléchargement après paiement</p>
                                    </div>

                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Gift size={16} className="text-purple-400" />
                                            <span className="text-purple-400 font-semibold text-sm">Garantie 30 jours</span>
                                        </div>
                                        <p className="text-purple-300 text-xs">Remboursement sans condition</p>
                                    </div>
                                </div>

                                {/* Méthodes de paiement */}
                                <div className="mt-6 pt-6 border-t border-gray-600">
                                    <p className="text-gray-400 text-sm mb-3">Méthodes acceptées :</p>
                                    <div className="flex gap-2">
                                        <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center text-xs font-bold text-white">💳</div>
                                        <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center text-xs font-bold text-white">🏦</div>
                                        <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center text-xs font-bold text-white">📱</div>
                                        <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center text-xs font-bold text-white">PP</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
