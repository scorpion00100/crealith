import React, { useState } from 'react';
import {
    X,
    ShoppingBag,
    Heart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Lock,
    Truck,
    Shield,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface CartItem {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    seller: {
        name: string;
        avatar?: string;
    };
    quantity: number;
    isDigital: boolean;
    downloadUrl?: string;
}

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemoveItem: (itemId: string) => void;
    onMoveToFavorites: (itemId: string) => void;
    onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
    isOpen,
    onClose,
    items,
    onUpdateQuantity,
    onRemoveItem,
    onMoveToFavorites,
    onCheckout
}) => {
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedTax = subtotal * 0.2; // 20% TVA
    const total = subtotal + estimatedTax;

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        // Simulate checkout process
        await new Promise(resolve => setTimeout(resolve, 1000));
        onCheckout();
        setIsCheckingOut(false);
    };

    const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => (
        <div className="bg-background-800 rounded-xl border border-background-700 p-4 hover:border-primary-500/30 transition-all duration-300">
            <div className="flex gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-background-700 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-100 text-sm line-clamp-2 mb-1">
                        {item.title}
                    </h4>

                    {/* Seller */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-primary-500/20 rounded-full flex items-center justify-center">
                            <span className="text-xs text-primary-400">V</span>
                        </div>
                        <span className="text-xs text-text-400 truncate">
                            {item.seller.name}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-primary-400">
                            {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-text-400 line-through">
                                {formatPrice(item.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-6 h-6 bg-background-700 hover:bg-background-600 rounded flex items-center justify-center transition-colors"
                            >
                                <Minus className="w-3 h-3 text-text-400" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-text-100">
                                {item.quantity}
                            </span>
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-background-700 hover:bg-background-600 rounded flex items-center justify-center transition-colors"
                            >
                                <Plus className="w-3 h-3 text-text-400" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onMoveToFavorites(item.id)}
                                className="p-1 text-text-400 hover:text-secondary-400 transition-colors"
                                title="Ajouter aux favoris"
                            >
                                <Heart className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1 text-text-400 hover:text-error-400 transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Digital Badge */}
                    {item.isDigital && (
                        <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-500/20 text-success-400 text-xs rounded-full">
                                <Download className="w-3 h-3" />
                                Produit digital
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                'fixed top-0 right-0 h-full w-full max-w-md bg-background-900 border-l border-background-700 z-50 transform transition-transform duration-300 ease-in-out',
                isOpen ? 'translate-x-0' : 'translate-x-full'
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-background-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-lg">
                                    <ShoppingBag className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-100">Panier</h2>
                                    <p className="text-sm text-text-400">
                                        {totalItems} article{totalItems > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-text-400 hover:text-text-200 hover:bg-background-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {items.length === 0 ? (
                            /* Empty Cart */
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-background-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="w-12 h-12 text-text-400" />
                                </div>
                                <h3 className="text-lg font-bold text-text-100 mb-2">
                                    Votre panier est vide
                                </h3>
                                <p className="text-text-400 mb-6">
                                    Découvrez nos produits digitaux et ajoutez-les à votre panier
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                                >
                                    Continuer mes achats
                                </button>
                            </div>
                        ) : (
                            /* Cart Items */
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <CartItemComponent key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="p-6 border-t border-background-700 space-y-4">
                            {/* Price Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-400">Sous-total</span>
                                    <span className="text-text-100">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-400">TVA (20%)</span>
                                    <span className="text-text-100">{formatPrice(estimatedTax)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-background-700 pt-2">
                                    <span className="text-text-100">Total</span>
                                    <span className="text-primary-400">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Security Badges */}
                            <div className="flex items-center justify-center gap-4 py-2">
                                <div className="flex items-center gap-1 text-xs text-text-400">
                                    <Shield className="w-3 h-3" />
                                    <span>Sécurisé</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-text-400">
                                    <Lock className="w-3 h-3" />
                                    <span>SSL</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-text-400">
                                    <Truck className="w-3 h-3" />
                                    <span>Instant</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Procéder au paiement
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {/* Trust Message */}
                            <p className="text-xs text-text-400 text-center">
                                Paiement sécurisé par Stripe • Téléchargement immédiat
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
