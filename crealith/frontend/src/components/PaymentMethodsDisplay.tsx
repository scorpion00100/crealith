import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';
import { getPaymentMethodsConfig } from '@/config/payment-methods';

interface PaymentMethodsDisplayProps {
    showTestCards?: boolean;
    className?: string;
}

export const PaymentMethodsDisplay: React.FC<PaymentMethodsDisplayProps> = ({
    showTestCards = true,
    className = ''
}) => {
    const config = getPaymentMethodsConfig();
    const [showTestInfo, setShowTestInfo] = useState(false);

    // Méthodes de paiement disponibles
    const availableMethods = [
        { name: 'Visa', icon: '💳', available: true },
        { name: 'Mastercard', icon: '💳', available: true },
        { name: 'American Express', icon: '💳', available: true },
        { name: 'Discover', icon: '💳', available: true },
        { name: 'Diners Club', icon: '💳', available: true },
        { name: 'JCB', icon: '💳', available: true }
    ];

    const comingSoonMethods = [
        { name: 'PayPal', icon: '🔵', available: false },
        { name: 'Apple Pay', icon: '🍎', available: false },
        { name: 'Google Pay', icon: '🔵', available: false }
    ];

    return (
        <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Méthodes de paiement</h3>
            </div>

            {/* Méthodes disponibles */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Cartes acceptées</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {availableMethods.map((method) => (
                        <div
                            key={method.name}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600"
                        >
                            <span className="text-lg">{method.icon}</span>
                            <span className="text-sm text-white font-medium">{method.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Méthodes à venir */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Bientôt disponibles</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {comingSoonMethods.map((method) => (
                        <div
                            key={method.name}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 opacity-60"
                        >
                            <span className="text-lg">{method.icon}</span>
                            <span className="text-sm text-gray-400 font-medium">{method.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Informations de test (discret) */}
            {config.showTestCards && showTestCards && (
                <div className="border-t border-gray-700 pt-4">
                    <button
                        onClick={() => setShowTestInfo(!showTestInfo)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        {showTestInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>Informations de test</span>
                    </button>

                    {showTestInfo && (
                        <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
                            <div className="text-xs text-gray-400 space-y-2">
                                <div className="font-medium text-gray-300 mb-2">Cartes de test Stripe :</div>
                                <div className="space-y-1">
                                    <div><span className="text-gray-500">Visa:</span> 4242 4242 4242 4242</div>
                                    <div><span className="text-gray-500">Mastercard:</span> 5555 5555 5555 4444</div>
                                    <div><span className="text-gray-500">Amex:</span> 3782 822463 10005</div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700">
                                    <div>Date: n'importe quelle date future</div>
                                    <div>CVC: n'importe quel code à 3 chiffres</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sécurité */}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Paiement sécurisé SSL</span>
                </div>
            </div>
        </div>
    );
};