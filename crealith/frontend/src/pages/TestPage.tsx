import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const TestPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-red-500 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Test Simple - Si vous voyez ceci en rouge, Tailwind fonctionne</h1>

                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Test des Couleurs de Base</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Bleu</p>
                        </div>
                        <div className="bg-green-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Vert</p>
                        </div>
                        <div className="bg-yellow-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Jaune</p>
                        </div>
                        <div className="bg-purple-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Violet</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Test des Couleurs Personnalisées</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-primary-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Primary</p>
                        </div>
                        <div className="bg-secondary-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Secondary</p>
                        </div>
                        <div className="bg-accent-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Accent</p>
                        </div>
                        <div className="bg-warm-500 text-white p-4 rounded text-center">
                            <p className="font-bold">Warm</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Test des Composants</h2>
                    <div className="space-y-4">
                        <Button variant="primary">Bouton Primary</Button>
                        <Button variant="secondary">Bouton Secondary</Button>
                        <Button variant="accent">Bouton Accent</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
