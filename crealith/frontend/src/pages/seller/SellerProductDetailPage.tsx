import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '@/store/slices/productSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import {
    Star,
    Download,
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    TrendingUp,
    Users,
    Package,
    ArrowLeft,
    Image as ImageIcon,
    FileText,
    Settings,
    CheckCircle,
    X
} from 'lucide-react';
import { productService } from '@/services/product.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const SellerProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAuth();

    const { currentProduct, isLoading } = useAppSelector(state => state.products);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        price: '',
        description: '',
        isActive: true
    });

    // Charger le produit
    useEffect(() => {
        if (id) {
            console.log('📦 Loading product:', id);
            dispatch(fetchProductById(id));
        }
    }, [id, dispatch]);

    // Initialiser les données d'édition quand le produit change
    useEffect(() => {
        if (currentProduct && currentProduct.id === id) {
            setEditData({
                title: currentProduct.title || '',
                price: currentProduct.price?.toString() || '',
                description: currentProduct.description || '',
                isActive: currentProduct.isActive ?? true
            });
        }
    }, [currentProduct, id]);

    // NOTE: Ownership check DÉSACTIVÉ côté frontend
    // Le backend vérifie déjà l'ownership via middleware requireOwnership
    // Cela évite les problèmes de timing et de state stale
    // Si l'utilisateur n'est pas propriétaire, le backend retournera 403

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const handleEdit = async () => {
        if (!currentProduct || !editData.title.trim() || !editData.price.trim()) {
            dispatch(addNotification({
                type: 'error',
                message: 'Veuillez remplir tous les champs obligatoires (titre et prix)',
                duration: 3000
            }));
            return;
        }

        const price = parseFloat(editData.price);
        if (isNaN(price) || price < 0) {
            dispatch(addNotification({
                type: 'error',
                message: 'Le prix doit être un nombre positif valide',
                duration: 3000
            }));
            return;
        }

        try {
            dispatch(addNotification({
                type: 'info',
                message: 'Mise à jour en cours...',
                duration: 2000
            }));

            await productService.updateProduct(currentProduct.id, {
                title: editData.title.trim(),
                price: price,
                description: editData.description.trim(),
                isActive: editData.isActive
            });

            dispatch(addNotification({
                type: 'success',
                message: 'Produit mis à jour avec succès',
                duration: 3000
            }));
            setIsEditing(false);
            // Recharger le produit
            dispatch(fetchProductById(currentProduct.id));
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors de la mise à jour',
                duration: 3000
            }));
        }
    };

    const handleCancelEdit = () => {
        if (currentProduct) {
            setEditData({
                title: currentProduct.title || '',
                price: currentProduct.price?.toString() || '',
                description: currentProduct.description || '',
                isActive: currentProduct.isActive ?? true
            });
        }
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!currentProduct) return;

        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer le produit "${currentProduct.title}" ?\n\n` +
            'Cette action est irréversible et supprimera :\n' +
            '• Le produit de votre catalogue\n' +
            '• Toutes les statistiques associées\n' +
            '• L\'accès pour les acheteurs\n\n' +
            'Cliquez sur "OK" pour confirmer la suppression.'
        );

        if (!confirmed) return;

        try {
            dispatch(addNotification({
                type: 'info',
                message: 'Suppression en cours...',
                duration: 2000
            }));

            await productService.deleteProduct(currentProduct.id);
            dispatch(addNotification({
                type: 'success',
                message: 'Produit supprimé avec succès',
                duration: 3000
            }));
            navigate('/seller-dashboard#products');
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors de la suppression',
                duration: 3000
            }));
        }
    };

    const handleDownload = async () => {
        if (!currentProduct?.fileUrl) {
            dispatch(addNotification({
                type: 'error',
                message: 'Aucun fichier disponible pour le téléchargement',
                duration: 3000
            }));
            return;
        }

        try {
            dispatch(addNotification({
                type: 'info',
                message: 'Préparation du téléchargement...',
                duration: 2000
            }));

            // For sellers (owners), we can directly download the file
            // For buyers, we would use the secure download API
            if (currentProduct.fileUrl) {
                // Create a temporary link for download
                const link = document.createElement('a');
                link.href = currentProduct.fileUrl;
                link.download = `${currentProduct.title.replace(/[^a-zA-Z0-9]/g, '_')}_Source_Files`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';

                // Add to DOM, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                dispatch(addNotification({
                    type: 'success',
                    message: 'Téléchargement démarré avec succès !',
                    duration: 3000
                }));
            }
        } catch (error: any) {
            console.error('Download error:', error);
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors du téléchargement. Veuillez réessayer.',
                duration: 3000
            }));
        }
    };

    if (isLoading) {
        return <LoadingSpinner fullScreen text="Chargement du produit..." />;
    }

    if (!currentProduct) {
        return (
            <div className="min-h-screen bg-background-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text-100 mb-4">Produit introuvable</h1>
                    <button
                        onClick={() => navigate('/seller-dashboard')}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
                    >
                        Retour au dashboard
                    </button>
                </div>
            </div>
        );
    }

    const images = currentProduct.images || [];
    const hasImages = images.length > 0;
    const mainImage = hasImages ? images[selectedImage] : currentProduct.image || currentProduct.thumbnailUrl;

    return (
        <div className="min-h-screen bg-background-900">
            {/* Header avec navigation */}
            <header className="bg-background-800 border-b border-background-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/seller-dashboard#products')}
                                className="p-2 text-text-400 hover:text-text-200 hover:bg-background-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-text-100">
                                    {isEditing ? 'Modifier le produit' : 'Détail du produit'}
                                </h1>
                                <p className="text-text-400">
                                    Gérez votre produit et suivez ses performances
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center gap-2 px-4 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Sauvegarder
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-2 px-4 py-2 bg-text-600 hover:bg-text-700 text-white rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2 bg-error-500 hover:bg-error-600 text-white rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Images du produit */}
                    <div className="space-y-4">
                        <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ImageIcon className="w-5 h-5 text-primary-400" />
                                <h2 className="text-lg font-semibold text-text-100">Images du produit</h2>
                            </div>

                            {/* Image principale */}
                            <div className="aspect-square bg-background-700 rounded-xl overflow-hidden mb-4">
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt={currentProduct.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `
                                                    <div class="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                                        <div class="text-white text-center">
                                                            <ImageIcon class="w-12 h-12 mx-auto mb-2" />
                                                            <p class="text-sm">Image non disponible</p>
                                                        </div>
                                                    </div>
                                                `;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                            <p className="text-sm">Aucune image</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Miniatures */}
                            {hasImages && images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index
                                                ? 'border-primary-500'
                                                : 'border-background-600 hover:border-background-500'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${currentProduct.title} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fichier numérique */}
                        <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-success-400" />
                                <h2 className="text-lg font-semibold text-text-100">Fichier numérique</h2>
                            </div>
                            {currentProduct.fileUrl ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-background-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-8 h-8 text-success-400" />
                                            <div>
                                                <p className="text-text-100 font-medium">Fichier source</p>
                                                <p className="text-text-400 text-sm">
                                                    {currentProduct.fileType || 'Fichier numérique'}
                                                    {currentProduct.fileSize && ` (${(currentProduct.fileSize / 1024 / 1024).toFixed(1)} MB)`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 px-6 py-3 bg-success-500 hover:bg-success-600 text-white rounded-lg transition-all duration-200 font-medium hover:scale-105 shadow-lg hover:shadow-success-500/25"
                                            title="Télécharger vos fichiers sources"
                                        >
                                            <Download className="w-5 h-5" />
                                            Télécharger maintenant
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-text-600 mx-auto mb-3" />
                                    <p className="text-text-400">Aucun fichier numérique disponible</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informations du produit */}
                    <div className="space-y-6">
                        {/* État du produit */}
                        <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings className="w-5 h-5 text-primary-400" />
                                <h2 className="text-lg font-semibold text-text-100">État du produit</h2>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentProduct.isActive
                                        ? 'bg-success-500/20 text-success-400'
                                        : 'bg-error-500/20 text-error-400'
                                        }`}>
                                        {currentProduct.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                    <span className="text-text-400 text-sm">
                                        {currentProduct.isActive
                                            ? 'Visible dans le catalogue'
                                            : 'Masqué des acheteurs'
                                        }
                                    </span>
                                </div>
                                {isEditing && (
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 text-text-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editData.isActive}
                                                onChange={(e) => setEditData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                className="rounded border-background-600 bg-background-700 text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-sm">Activer</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            {!isEditing && (
                                <div className="mt-4 p-3 bg-background-700 rounded-lg">
                                    <p className="text-text-300 text-sm">
                                        {currentProduct.isActive
                                            ? '✅ Votre produit est visible et peut être acheté par les clients.'
                                            : '❌ Votre produit est masqué et ne peut pas être acheté.'
                                        }
                                    </p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-2 text-primary-400 hover:text-primary-300 text-sm font-medium"
                                    >
                                        Cliquez sur "Modifier" pour changer l'état
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Informations de base */}
                        <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            <h2 className="text-lg font-semibold text-text-100 mb-4">Informations de base</h2>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-text-300 mb-1">Titre</label>
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-300 mb-1">Prix (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editData.price}
                                            onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                                            className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-300 mb-1">Description</label>
                                        <textarea
                                            rows={4}
                                            value={editData.description}
                                            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-text-100 mb-2">{currentProduct.title}</h3>
                                        <p className="text-2xl font-bold text-primary-400 mb-4">
                                            {formatPrice(parseFloat(currentProduct.price || '0'))}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-300 leading-relaxed">
                                            {currentProduct.description || 'Aucune description disponible.'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div>
                                            <p className="text-sm text-text-400">Catégorie</p>
                                            <p className="text-text-100 font-medium">
                                                {currentProduct.category?.name || 'Non définie'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-text-400">Date de création</p>
                                            <p className="text-text-100 font-medium">
                                                {currentProduct.createdAt
                                                    ? new Date(currentProduct.createdAt).toLocaleDateString('fr-FR')
                                                    : 'Non disponible'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-text-400">Dernière modification</p>
                                            <p className="text-text-100 font-medium">
                                                {currentProduct.updatedAt
                                                    ? new Date(currentProduct.updatedAt).toLocaleDateString('fr-FR')
                                                    : 'Non disponible'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-text-400">ID du produit</p>
                                            <p className="text-text-100 font-mono text-sm">
                                                {currentProduct.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Statistiques */}
                        <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text-100">Statistiques de performance</h2>
                                <div className="flex items-center gap-2 text-text-400 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Mis à jour en temps réel</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-background-700 rounded-lg hover:bg-background-600 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-success-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-text-100">
                                        {currentProduct.downloadsCount || currentProduct.downloads || currentProduct.totalSales || 0}
                                    </p>
                                    <p className="text-sm text-text-400">Téléchargements</p>
                                    <p className="text-xs text-success-400 mt-1">Revenus générés</p>
                                </div>
                                <div className="text-center p-4 bg-background-700 rounded-lg hover:bg-background-600 transition-colors">
                                    <Eye className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-text-100">
                                        {currentProduct.viewsCount || currentProduct.views || 0}
                                    </p>
                                    <p className="text-sm text-text-400">Vues totales</p>
                                    <p className="text-xs text-primary-400 mt-1">Taux de conversion</p>
                                </div>
                                <div className="text-center p-4 bg-background-700 rounded-lg hover:bg-background-600 transition-colors">
                                    <Star className="w-6 h-6 text-warning-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-text-100">
                                        {currentProduct.averageRating || currentProduct.rating || 0}
                                        {currentProduct.averageRating || currentProduct.rating ? '/5' : ''}
                                    </p>
                                    <p className="text-sm text-text-400">Note moyenne</p>
                                    <p className="text-xs text-warning-400 mt-1">Satisfaction client</p>
                                </div>
                                <div className="text-center p-4 bg-background-700 rounded-lg hover:bg-background-600 transition-colors">
                                    <Users className="w-6 h-6 text-secondary-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-text-100">
                                        {currentProduct.reviewsCount || currentProduct.totalReviews || currentProduct.reviews || 0}
                                    </p>
                                    <p className="text-sm text-text-400">Avis clients</p>
                                    <p className="text-xs text-secondary-400 mt-1">Engagement</p>
                                </div>
                            </div>

                            {/* Métriques avancées */}
                            <div className="mt-6 pt-4 border-t border-background-700">
                                <h3 className="text-md font-semibold text-text-100 mb-3">Métriques avancées</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center p-3 bg-background-700 rounded-lg">
                                        <span className="text-text-300">Taux de conversion</span>
                                        <span className="text-text-100 font-medium">
                                            {currentProduct.viewsCount && currentProduct.downloadsCount
                                                ? `${((currentProduct.downloadsCount / currentProduct.viewsCount) * 100).toFixed(1)}%`
                                                : '0%'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-background-700 rounded-lg">
                                        <span className="text-text-300">Revenus estimés</span>
                                        <span className="text-success-400 font-medium">
                                            {formatPrice(
                                                (currentProduct.downloadsCount || currentProduct.downloads || currentProduct.totalSales || 0) *
                                                parseFloat(currentProduct.price || '0')
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-background-700 rounded-lg">
                                        <span className="text-text-300">Statut de performance</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(currentProduct.downloadsCount || currentProduct.downloads || 0) > 100
                                            ? 'bg-success-500/20 text-success-400'
                                            : (currentProduct.downloadsCount || currentProduct.downloads || 0) > 10
                                                ? 'bg-warning-500/20 text-warning-400'
                                                : 'bg-text-600/20 text-text-400'
                                            }`}>
                                            {(currentProduct.downloadsCount || currentProduct.downloads || 0) > 100
                                                ? 'Excellent'
                                                : (currentProduct.downloadsCount || currentProduct.downloads || 0) > 10
                                                    ? 'Bon'
                                                    : 'En développement'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SellerProductDetailPage;
