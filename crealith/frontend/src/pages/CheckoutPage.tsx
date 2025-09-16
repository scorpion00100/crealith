import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { fetchCart, clearCartAsync } from '@/store/slices/cartSlice';
import { createOrder } from '@/store/slices/orderSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { Lock, CreditCard, Shield, CheckCircle } from 'lucide-react';

// Charger Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

interface CheckoutFormProps {
    onSuccess: () => void;
    onError: (message: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { items, totalAmount } = useAppSelector(state => state.cart);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            // Créer la commande (retourne { order, clientSecret })
            const creation = await dispatch(createOrder({ paymentMethod: 'card' })).unwrap();
            const createdOrder = creation?.order || creation?.data?.order || creation?.data?.order;
            const clientSecret = creation?.clientSecret || creation?.data?.clientSecret;
            setOrderId(createdOrder.id);

            // Confirmer le paiement avec Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement)!,
                    },
                }
            );

            if (error) {
                onError(error.message || 'Erreur lors du paiement');
                setIsProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Confirmer la commande côté serveur
                await dispatch(createOrder({
                    paymentMethod: 'card',
                    orderId: createdOrder.id,
                    paymentIntentId: paymentIntent.id
                })).unwrap();

                // Vider le panier
                await dispatch(clearCartAsync()).unwrap();

                onSuccess();
            }
        } catch (error: any) {
            onError(error.message || 'Erreur lors du traitement de la commande');
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
                <h3>Informations de paiement</h3>
                <div className="card-element-container">
                    <CardElement options={cardElementOptions} />
                </div>
            </div>

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="btn btn-primary btn-large btn-full"
            >
                {isProcessing ? (
                    <>
                        <div className="spinner"></div>
                        Traitement en cours...
                    </>
                ) : (
                    <>
                        <Lock size={20} />
                        Payer {totalAmount.toFixed(2)} €
                    </>
                )}
            </button>
        </form>
    );
};

export const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAuth();

    const { items, totalAmount, subtotal, platformFee } = useAppSelector(state => state.cart);
    const [step, setStep] = useState<'checkout' | 'success'>('checkout');

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour finaliser votre commande',
                duration: 4000
            }));
            navigate('/login?redirect=/checkout');
            return;
        }

        if (items.length === 0) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Votre panier est vide',
                duration: 3000
            }));
            navigate('/cart');
            return;
        }

        dispatch(fetchCart());
    }, [dispatch, isAuthenticated, navigate, items.length]);

    const handleSuccess = () => {
        setStep('success');
        dispatch(addNotification({
            type: 'success',
            message: 'Paiement réussi ! Votre commande a été confirmée.',
            duration: 5000
        }));
        // Redirection douce vers les commandes
        setTimeout(() => navigate('/orders'), 1500);
    };

    const handleError = (message: string) => {
        dispatch(addNotification({
            type: 'error',
            message: message,
            duration: 5000
        }));
        // Option: rester sur place, ou guider vers /cart en cas d'échec de paiement
    };

    const handleContinueShopping = () => {
        navigate('/catalog');
    };

    const handleViewOrders = () => {
        navigate('/dashboard?tab=orders');
    };

    if (step === 'success') {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="success-container">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h1>Paiement réussi !</h1>
                        <p>Votre commande a été confirmée et vos fichiers sont maintenant disponibles.</p>

                        <div className="success-actions">
                            <button className="btn btn-primary" onClick={handleViewOrders}>
                                Voir mes commandes
                            </button>
                            <button className="btn btn-outline" onClick={handleContinueShopping}>
                                Continuer les achats
                            </button>
                        </div>

                        <div className="success-info">
                            <h3>Prochaines étapes :</h3>
                            <ul>
                                <li>📧 Vous recevrez un email de confirmation</li>
                                <li>📦 Accédez à vos fichiers depuis votre dashboard</li>
                                <li>⭐ Laissez un avis sur les produits achetés</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-header">
                    <h1>Finaliser la commande</h1>
                    <p>Récapitulatif de votre commande</p>
                </div>

                <div className="checkout-content">
                    <div className="checkout-main">
                        <div className="order-summary">
                            <h2>Récapitulatif de la commande</h2>

                            <div className="order-items">
                                {items.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-image">
                                            <img
                                                src={item.product.thumbnailUrl || item.product.image}
                                                alt={item.product.title}
                                            />
                                        </div>

                                        <div className="item-details">
                                            <h3>{item.product.title}</h3>
                                            <p>Quantité: {item.quantity}</p>
                                        </div>

                                        <div className="item-price">
                                            {(parseFloat(item.product.price) * item.quantity).toFixed(2)} €
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-totals">
                                <div className="total-line">
                                    <span>Sous-total</span>
                                    <span>{subtotal.toFixed(2)} €</span>
                                </div>
                                <div className="total-line">
                                    <span>Frais de plateforme (5%)</span>
                                    <span>{platformFee.toFixed(2)} €</span>
                                </div>
                                <div className="total-line total">
                                    <span>Total</span>
                                    <span>{totalAmount.toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>

                        <div className="payment-section">
                            <h2>Paiement sécurisé</h2>
                            <p>Vos informations de paiement sont protégées par un chiffrement SSL.</p>

                            <Elements stripe={stripePromise}>
                                <CheckoutForm onSuccess={handleSuccess} onError={handleError} />
                            </Elements>
                        </div>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="security-info">
                            <h3>🔒 Paiement sécurisé</h3>
                            <ul>
                                <li>Chiffrement SSL 256-bit</li>
                                <li>Certification PCI DSS</li>
                                <li>Protection contre la fraude</li>
                            </ul>
                        </div>

                        <div className="guarantee-info">
                            <h3>🛡️ Garantie client</h3>
                            <ul>
                                <li>Accès immédiat après paiement</li>
                                <li>Remboursement sous 30 jours</li>
                                <li>Support client 24/7</li>
                            </ul>
                        </div>

                        <div className="payment-methods">
                            <h3>💳 Méthodes acceptées</h3>
                            <div className="payment-icons">
                                <span>Visa</span>
                                <span>Mastercard</span>
                                <span>American Express</span>
                                <span>PayPal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
