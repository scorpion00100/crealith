import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { EditProductData } from '@/hooks/useProductDetails';

interface ProductEditFormProps {
    editData: EditProductData;
    setEditData: React.Dispatch<React.SetStateAction<EditProductData>>;
    onSave: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
    editData,
    setEditData,
    onSave,
    onCancel,
    isLoading = false
}) => {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Modifier le produit</h2>

            <div className="space-y-6">
                {/* Titre */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Titre *
                    </label>
                    <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Titre du produit"
                        disabled={isLoading}
                    />
                </div>

                {/* Prix */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prix (€) *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editData.price}
                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="9.99"
                        disabled={isLoading}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        placeholder="Description détaillée du produit"
                        disabled={isLoading}
                    />
                </div>

                {/* Statut actif */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={editData.isActive}
                        onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-300">
                        Produit actif (visible dans le catalogue)
                    </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Enregistrer
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5" />
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

