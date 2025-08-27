import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItemAsync, removeFromCartAsync, clearCartAsync } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';

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
            <div className="cart-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner">Chargement du panier...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <button className="btn btn-outline" onClick={handleContinueShopping}>
                        <ArrowLeft size={20} />
                        Continuer les achats
                    </button>
                    <h1>Mon Panier</h1>
                    {items.length > 0 && (
                        <button className="btn btn-outline btn-danger" onClick={handleClearCart}>
                            <Trash2 size={20} />
                            Vider le panier
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <ShoppingCart size={64} />
                        </div>
                        <h2>Votre panier est vide</h2>
                        <p>Découvrez nos produits et commencez vos achats</p>
                        <button className="btn btn-primary btn-large" onClick={handleContinueShopping}>
                            Explorer le catalogue
                        </button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            <h2>Produits ({items.length})</h2>

                            {items.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <img
                                            src={item.product.thumbnailUrl || item.product.image}
                                            alt={item.product.title}
                                        />
                                    </div>

                                    <div className="item-details">
                                        <h3 className="item-title">{item.product.title}</h3>
                                        <p className="item-author">
                                            par {item.product.user?.firstName} {item.product.user?.lastName}
                                        </p>
                                        <div className="item-tags">
                                            {item.product.tags?.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="tag">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="item-quantity">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="item-price">
                                        <span className="price">
                                            {(parseFloat(item.product.price) * item.quantity).toFixed(2)} €
                                        </span>
                                        <span className="unit-price">
                                            {item.product.price} € / unité
                                        </span>
                                    </div>

                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Résumé de la commande</h2>

                            <div className="summary-items">
                                <div className="summary-item">
                                    <span>Sous-total</span>
                                    <span>{subtotal.toFixed(2)} €</span>
                                </div>
                                <div className="summary-item">
                                    <span>Frais de plateforme (5%)</span>
                                    <span>{platformFee.toFixed(2)} €</span>
                                </div>
                                <div className="summary-item total">
                                    <span>Total</span>
                                    <span>{totalAmount.toFixed(2)} €</span>
                                </div>
                            </div>

                            <div className="summary-actions">
                                <button
                                    className="btn btn-primary btn-large btn-full"
                                    onClick={handleCheckout}
                                >
                                    Procéder au paiement
                                </button>

                                <div className="payment-methods">
                                    <p>Méthodes de paiement acceptées :</p>
                                    <div className="payment-icons">
                                        <span>💳</span>
                                        <span>🏦</span>
                                        <span>📱</span>
                                    </div>
                                </div>

                                <div className="security-info">
                                    <p>🔒 Paiement sécurisé par Stripe</p>
                                    <p>📦 Accès immédiat après paiement</p>
                                    <p>🔄 Garantie de remboursement 30 jours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
