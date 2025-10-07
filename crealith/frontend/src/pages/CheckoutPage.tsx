import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { fetchCart, clearCartAsync } from '@/store/slices/cartSlice';
import { createOrder } from '@/store/slices/orderSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { PaymentMethodsSimple } from '@/components/PaymentMethodsSimple';
import { DeveloperTestInfo } from '@/components/DeveloperTestInfo';
import {
    Lock,
    CreditCard,
    Shield,
    CheckCircle,
    ArrowLeft,
    ShoppingCart,
    Sparkles,
    Star,
    Download,
    Gift,
    Heart,
    AlertCircle,
    Clock,
    Truck,
    Mail,
    Phone,
    MapPin,
    ChevronRight,
    Zap,
    Award,
    Users
} from 'lucide-react';

// Charger Stripe
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
if (!publishableKey) {
    // Clé manquante: empêcher l'utilisation d'une clé placeholder qui provoque un 401
    // Log clair pour le développeur
    // eslint-disable-next-line no-console
    logger.error('Stripe publishable key is missing. Set VITE_STRIPE_PUBLISHABLE_KEY in your frontend env.');
}
const stripePromise = loadStripe(publishableKey || '');

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
                fontSize: '18px',
                color: '#F9FAFB',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '500',
                '::placeholder': {
                    color: '#9CA3AF',
                    fontSize: '16px',
                },
                backgroundColor: '#374151',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #4B5563',
                boxShadow: '0 0 0 0 transparent',
            },
            invalid: {
                color: '#F43F5E',
                border: '2px solid #F43F5E',
                backgroundColor: '#374151',
            },
            complete: {
                border: '2px solid #10B981',
                backgroundColor: '#374151',
            },
        },
        hidePostalCode: true, // ✅ Masque le champ code postal
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de paiement */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Informations de paiement</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">
                            Informations de la carte
                        </label>
                        <div className="bg-gray-700 rounded-lg p-2 border border-gray-600 hover:border-gray-500 transition-colors">
                            <CardElement options={cardElementOptions} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Shield className="w-4 h-4" />
                            <span>Vos informations sont sécurisées par Stripe</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bouton de paiement */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div>
                            <div className="text-lg font-semibold text-white">Total à payer</div>
                            <div className="text-sm text-gray-400">TVA incluse</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {totalAmount.toFixed(2)} €
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!stripe || isProcessing}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-5 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                Traitement en cours...
                            </>
                        ) : (
                            <>
                                <Lock className="w-6 h-6" />
                                Finaliser le paiement
                                <Sparkles className="w-6 h-6" />
                            </>
                        )}
                    </button>

                    <div className="text-center text-sm text-gray-400">
                        Vous serez redirigé vers une page sécurisée
                    </div>
                </div>
            </div>
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
            message: '🎉 Paiement réussi ! Votre commande a été confirmée.',
            duration: 5000
        }));
        // Redirection vers les téléchargements après 3 secondes
        setTimeout(() => navigate('/downloads'), 3000);
    };

    const handleError = (message: string) => {
        dispatch(addNotification({
            type: 'error',
            message: `❌ Échec du paiement : ${message}`,
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
            <div className="min-h-screen bg-gray-900">
                {/* Header */}
                <div className="bg-gray-800 border-b border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/catalog')}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Retour au catalogue</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span className="font-semibold">Crealith</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-12">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            🎉 Paiement réussi !
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            Votre commande a été confirmée et vos fichiers sont maintenant disponibles.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        <button
                            onClick={() => navigate('/downloads')}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                        >
                            <Download className="w-5 h-5" />
                            Mes téléchargements
                        </button>
                        <button
                            onClick={handleViewOrders}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border border-gray-700"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Mes commandes
                        </button>
                        <button
                            onClick={handleContinueShopping}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border border-gray-700"
                        >
                            <Gift className="w-5 h-5" />
                            Continuer mes achats
                        </button>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            Prochaines étapes
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Email de confirmation</h4>
                                    <p className="text-gray-400 text-sm">Vous recevrez un email avec tous les détails de votre commande</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-600 rounded-lg">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Accès immédiat</h4>
                                    <p className="text-gray-400 text-sm">Téléchargez vos fichiers dès maintenant depuis votre dashboard</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-yellow-600 rounded-lg">
                                    <Star className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Laissez un avis</h4>
                                    <p className="text-gray-400 text-sm">Partagez votre expérience et aidez la communauté</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guarantees */}
                    <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-green-400" />
                            Nos garanties
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-green-400" />
                                <span className="text-gray-300">Accès à vie à vos fichiers</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="text-gray-300">Support client 24/7</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-red-400" />
                                <span className="text-gray-300">Remboursement sous 30 jours</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <span className="text-gray-300">Qualité garantie</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/cart')}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Retour au panier</span>
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Finaliser votre commande
                    </h1>
                    <p className="text-gray-400">
                        Paiement sécurisé • Accès immédiat • Garantie satisfait ou remboursé
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Récapitulatif de la commande */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-600 rounded-lg">
                                    <ShoppingCart className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Récapitulatif de la commande</h2>
                            </div>

                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                                            <img
                                                src={item.product.thumbnailUrl || item.product.image}
                                                alt={item.product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-1">{item.product.title}</h3>
                                            <p className="text-gray-400 text-sm">Quantité: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-white">
                                                {(parseFloat(item.product.price) * item.quantity).toFixed(2)} €
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Sous-total</span>
                                        <span>{subtotal.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Frais de plateforme (5%)</span>
                                        <span>{platformFee.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-gray-700">
                                        <span>Total</span>
                                        <span>{totalAmount.toFixed(2)} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section de paiement */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-600 rounded-lg">
                                    <Lock className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Paiement sécurisé</h2>
                            </div>

                            <Elements stripe={stripePromise}>
                                <CheckoutForm onSuccess={handleSuccess} onError={handleError} />
                            </Elements>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Sécurité */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-600 rounded-lg">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Paiement sécurisé</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-gray-300 text-sm">Chiffrement SSL 256-bit</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-gray-300 text-sm">Certification PCI DSS</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-gray-300 text-sm">Protection contre la fraude</span>
                                </div>
                            </div>
                        </div>

                        {/* Garanties */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Nos garanties</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Download className="w-4 h-4 text-blue-400" />
                                    <span className="text-gray-300 text-sm">Accès immédiat après paiement</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Heart className="w-4 h-4 text-red-400" />
                                    <span className="text-gray-300 text-sm">Remboursement sous 30 jours</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    <span className="text-gray-300 text-sm">Support client 24/7</span>
                                </div>
                            </div>
                        </div>

                        {/* Méthodes de paiement */}
                        <PaymentMethodsSimple />

                        {/* Info rapide */}
                        <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-xl p-6 border border-indigo-600">
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <h3 className="text-lg font-semibold text-white">Pourquoi choisir Crealith ?</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-200">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span>Plus de 10 000 créateurs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-green-400" />
                                    <span>Livraison instantanée</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <span>Qualité premium garantie</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info de test pour développeurs */}
            <DeveloperTestInfo />
        </div>
    );
};
