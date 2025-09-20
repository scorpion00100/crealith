import React from 'react';
import { CreditCard, Shield, CheckCircle, Clock } from 'lucide-react';
import { VisaLogo, MastercardLogo, PayPalLogo } from './payment-logos';

interface PaymentMethodsSimpleProps {
    className?: string;
}

export const PaymentMethodsSimple: React.FC<PaymentMethodsSimpleProps> = ({
    className = ''
}) => {
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
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Méthodes acceptées</span>
                </div>

                <div className="space-y-3">
                    {/* Visa */}
                    <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="w-16 h-10 rounded flex items-center justify-center overflow-hidden">
                            <VisaLogo width={64} height={40} />
                        </div>
                        <div>
                            <div className="text-white font-medium">Visa</div>
                            <div className="text-gray-400 text-sm">Toutes les cartes Visa</div>
                        </div>
                        <div className="ml-auto">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                    </div>

                    {/* Mastercard */}
                    <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="w-16 h-10 rounded flex items-center justify-center overflow-hidden">
                            <MastercardLogo width={64} height={40} />
                        </div>
                        <div>
                            <div className="text-white font-medium">Mastercard</div>
                            <div className="text-gray-400 text-sm">Toutes les cartes Mastercard</div>
                        </div>
                        <div className="ml-auto">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                    </div>

                    {/* PayPal */}
                    <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600 opacity-60">
                        <div className="w-16 h-10 rounded flex items-center justify-center overflow-hidden">
                            <PayPalLogo width={64} height={40} />
                        </div>
                        <div>
                            <div className="text-white font-medium">PayPal</div>
                            <div className="text-gray-400 text-sm">Paiement sécurisé PayPal</div>
                        </div>
                        <div className="ml-auto">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sécurité */}
            <div className="flex items-center gap-3 p-4 bg-green-900/20 rounded-lg border border-green-600/30">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                    <div className="text-sm font-medium text-green-400">Paiement sécurisé</div>
                    <div className="text-xs text-green-300">Chiffrement SSL 256-bit • Protection Stripe</div>
                </div>
            </div>
        </div>
    );
};