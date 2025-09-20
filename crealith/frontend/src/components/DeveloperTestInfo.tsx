import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Copy, Check } from 'lucide-react';

export const DeveloperTestInfo: React.FC = () => {
    const [showInfo, setShowInfo] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const testCards = [
        { number: '4242 4242 4242 4242', type: 'Visa', color: 'blue' },
        { number: '5555 5555 5555 4444', type: 'Mastercard', color: 'red' },
        { number: '3782 822463 10005', type: 'Amex', color: 'green' }
    ];

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    // Ne s'affiche qu'en mode développement
    if (import.meta.env.VITE_NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg shadow-lg transition-colors"
            >
                {showInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>Test Cards</span>
            </button>

            {showInfo && (
                <div className="absolute bottom-12 right-0 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-medium">Cartes de test Stripe</span>
                    </div>

                    <div className="space-y-3">
                        {testCards.map((card) => (
                            <div key={card.type} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-4 rounded bg-${card.color}-600 flex items-center justify-center`}>
                                        <span className="text-white text-xs font-bold">
                                            {card.type === 'Visa' ? 'V' : card.type === 'Mastercard' ? 'MC' : 'AE'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-mono">{card.number}</div>
                                        <div className="text-gray-400 text-xs">{card.type}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(card.number.replace(/\s/g, ''), card.type)}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    {copied === card.type ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                        <div>Date: 12/2025</div>
                        <div>CVC: 123</div>
                    </div>
                </div>
            )}
        </div>
    );
};
