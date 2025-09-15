import React, { useState } from 'react';
import {
    CreditCard,
    User,
    CheckCircle,
    Lock,
    Shield,
    Truck,
    Download,
    ArrowRight,
    ArrowLeft,
    Star,
    Heart
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface CartItem {
    id: string;
    title: string;
    price: number;
    image: string;
    seller: {
        name: string;
        avatar?: string;
    };
    quantity: number;
    isDigital: boolean;
}

interface CheckoutWizardProps {
    items: CartItem[];
    onComplete: (orderData: any) => void;
    onCancel: () => void;
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'apple' | 'google';
    name: string;
    icon: string;
    description: string;
}

const paymentMethods: PaymentMethod[] = [
    {
        id: 'card',
        type: 'card',
        name: 'Carte bancaire',
        icon: '💳',
        description: 'Visa, Mastercard, American Express'
    },
    {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        description: 'Paiement sécurisé avec PayPal'
    },
    {
        id: 'apple',
        type: 'apple',
        name: 'Apple Pay',
        icon: '🍎',
        description: 'Paiement rapide et sécurisé'
    },
    {
        id: 'google',
        type: 'google',
        name: 'Google Pay',
        icon: 'G',
        description: 'Paiement en un clic'
    }
];

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
    items,
    onComplete,
    onCancel
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderData, setOrderData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardName: '',
        saveCard: false,
        acceptTerms: false
    });

    const totalSteps = 3;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.2; // 20% TVA
    const total = subtotal + tax;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setOrderData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        onComplete({
            ...orderData,
            items,
            total,
            paymentMethod: selectedPaymentMethod,
            orderId: `ORD-${Date.now()}`
        });

        setIsProcessing(false);
    };

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1:
                return orderData.email && orderData.firstName && orderData.lastName;
            case 2:
                return orderData.address && orderData.city && orderData.postalCode;
            case 3:
                return orderData.acceptTerms && (
                    selectedPaymentMethod === 'paypal' ||
                    (orderData.cardNumber && orderData.expiryDate && orderData.cvv && orderData.cardName)
                );
            default:
                return false;
        }
    };

    const StepIndicator: React.FC = () => (
        <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center">
                        <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
                            currentStep > index + 1
                                ? 'bg-success-500 text-white'
                                : currentStep === index + 1
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-background-700 text-text-400'
                        )}>
                            {currentStep > index + 1 ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span className={cn(
                            'ml-2 text-sm font-medium',
                            currentStep >= index + 1 ? 'text-text-100' : 'text-text-400'
                        )}>
                            {index === 0 && 'Informations'}
                            {index === 1 && 'Adresse'}
                            {index === 2 && 'Paiement'}
                        </span>
                    </div>
                    {index < totalSteps - 1 && (
                        <div className={cn(
                            'w-16 h-0.5 mx-4 transition-all duration-300',
                            currentStep > index + 1 ? 'bg-success-500' : 'bg-background-700'
                        )} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const OrderSummary: React.FC = () => (
        <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
            <h3 className="text-lg font-bold text-text-100 mb-4">Résumé de la commande</h3>

            <div className="space-y-3 mb-6">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-background-700 rounded-lg flex-shrink-0 overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-text-100 text-sm truncate">{item.title}</h4>
                            <p className="text-xs text-text-400">par {item.seller.name}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-text-400">Qté: {item.quantity}</span>
                                <span className="font-bold text-primary-400">
                                    {formatPrice(item.price * item.quantity)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2 border-t border-background-700 pt-4">
                <div className="flex justify-between text-sm">
                    <span className="text-text-400">Sous-total</span>
                    <span className="text-text-100">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-text-400">TVA (20%)</span>
                    <span className="text-text-100">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-background-700 pt-2">
                    <span className="text-text-100">Total</span>
                    <span className="text-primary-400">{formatPrice(total)}</span>
                </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-background-700">
                <div className="flex items-center gap-1 text-xs text-text-400">
                    <Shield className="w-3 h-3" />
                    <span>Sécurisé</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-400">
                    <Lock className="w-3 h-3" />
                    <span>SSL</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-400">
                    <Download className="w-3 h-3" />
                    <span>Instant</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-100 mb-2">Finaliser votre commande</h1>
                    <p className="text-text-400">Paiement sécurisé et téléchargement immédiat</p>
                </div>

                <StepIndicator />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            {/* Step 1: Customer Information */}
                            {currentStep === 1 && (
                                <div>
                                    <h2 className="text-xl font-bold text-text-100 mb-6 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Informations personnelles
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-200 mb-2">
                                                Prénom *
                                            </label>
                                            <input
                                                type="text"
                                                value={orderData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Votre prénom"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-200 mb-2">
                                                Nom *
                                            </label>
                                            <input
                                                type="text"
                                                value={orderData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Votre nom"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-text-200 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={orderData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="votre@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Address */}
                            {currentStep === 2 && (
                                <div>
                                    <h2 className="text-xl font-bold text-text-100 mb-6 flex items-center gap-2">
                                        <Truck className="w-5 h-5" />
                                        Adresse de facturation
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-200 mb-2">
                                                Adresse *
                                            </label>
                                            <input
                                                type="text"
                                                value={orderData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="123 Rue de la Paix"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-text-200 mb-2">
                                                    Ville *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderData.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    placeholder="Paris"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-200 mb-2">
                                                    Code postal *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderData.postalCode}
                                                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                                    className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    placeholder="75001"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-200 mb-2">
                                                Pays
                                            </label>
                                            <select
                                                value={orderData.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="France">France</option>
                                                <option value="Belgique">Belgique</option>
                                                <option value="Suisse">Suisse</option>
                                                <option value="Canada">Canada</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Payment */}
                            {currentStep === 3 && (
                                <div>
                                    <h2 className="text-xl font-bold text-text-100 mb-6 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Méthode de paiement
                                    </h2>

                                    {/* Payment Methods */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedPaymentMethod(method.id)}
                                                className={cn(
                                                    'p-4 border-2 rounded-xl text-left transition-all duration-200',
                                                    selectedPaymentMethod === method.id
                                                        ? 'border-primary-500 bg-primary-500/10'
                                                        : 'border-background-600 hover:border-primary-500/50'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{method.icon}</span>
                                                    <div>
                                                        <h4 className="font-medium text-text-100">{method.name}</h4>
                                                        <p className="text-sm text-text-400">{method.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Card Details */}
                                    {selectedPaymentMethod === 'card' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-200 mb-2">
                                                    Nom sur la carte *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderData.cardName}
                                                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                                                    className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    placeholder="Jean Dupont"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-200 mb-2">
                                                    Numéro de carte *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderData.cardNumber}
                                                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                                                    className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    placeholder="1234 5678 9012 3456"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                                        Date d'expiration *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={orderData.expiryDate}
                                                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                        placeholder="MM/AA"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                                        CVV *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={orderData.cvv}
                                                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms */}
                                    <div className="mt-6 p-4 bg-background-700 rounded-xl">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={orderData.acceptTerms}
                                                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                                                className="mt-1 w-4 h-4 text-primary-500 bg-background-600 border-background-500 rounded focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-text-300">
                                                J'accepte les{' '}
                                                <a href="#" className="text-primary-400 hover:text-primary-300 underline">
                                                    conditions générales de vente
                                                </a>{' '}
                                                et la{' '}
                                                <a href="#" className="text-primary-400 hover:text-primary-300 underline">
                                                    politique de confidentialité
                                                </a>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-background-700">
                                <button
                                    onClick={currentStep === 1 ? onCancel : handlePrevious}
                                    className="flex items-center gap-2 px-6 py-3 text-text-400 hover:text-text-200 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {currentStep === 1 ? 'Annuler' : 'Précédent'}
                                </button>

                                {currentStep < totalSteps ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={!isStepValid(currentStep)}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                                    >
                                        Suivant
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleComplete}
                                        disabled={!isStepValid(currentStep) || isProcessing}
                                        className="flex items-center gap-2 px-6 py-3 bg-success-500 hover:bg-success-600 disabled:bg-success-500/50 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Traitement...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                Payer {formatPrice(total)}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <OrderSummary />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
