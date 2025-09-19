import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { reviewService } from '@/services/review.service';
import { Star, MessageSquare, Calendar, ThumbsUp, Edit, Trash2 } from 'lucide-react';

interface ReviewItem {
    id: string;
    productId: string;
    productTitle: string;
    productImage?: string;
    rating: number;
    comment: string;
    createdAt: string;
    status: 'published' | 'pending' | 'rejected';
    helpful: number;
}

export const MyReviewsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Pour le MVP, on simule des avis
                const mockReviews: ReviewItem[] = [
                    {
                        id: '1',
                        productId: 'prod-1',
                        productTitle: 'Template PowerPoint Moderne',
                        productImage: '/placeholder-product.jpg',
                        rating: 5,
                        comment: 'Excellent template, très professionnel et facile à utiliser. Je le recommande vivement !',
                        createdAt: '2025-01-15T10:30:00Z',
                        status: 'published',
                        helpful: 12
                    },
                    {
                        id: '2',
                        productId: 'prod-2',
                        productTitle: 'Pack Icônes Minimalistes',
                        productImage: '/placeholder-product.jpg',
                        rating: 4,
                        comment: 'Très bon pack d\'icônes, qualité correcte. Quelques icônes manquantes mais globalement satisfait.',
                        createdAt: '2025-01-10T14:20:00Z',
                        status: 'published',
                        helpful: 8
                    },
                    {
                        id: '3',
                        productId: 'prod-3',
                        productTitle: 'Mockup iPhone Premium',
                        productImage: '/placeholder-product.jpg',
                        rating: 5,
                        comment: 'Parfait ! Qualité exceptionnelle, très réaliste. Parfait pour mes présentations.',
                        createdAt: '2025-01-08T16:45:00Z',
                        status: 'pending',
                        helpful: 0
                    }
                ];

                if (mounted) {
                    setReviews(mockReviews);
                }
            } catch (e: any) {
                setError(e?.message || 'Erreur lors du chargement des avis');
                dispatch(addNotification({
                    type: 'error',
                    message: 'Erreur lors du chargement des avis',
                    duration: 4000
                }));
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        })();
        return () => { mounted = false; };
    }, [dispatch]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'text-success-400 bg-success-500/15';
            case 'pending':
                return 'text-yellow-400 bg-yellow-500/15';
            case 'rejected':
                return 'text-error-400 bg-error-500/15';
            default:
                return 'text-text-400 bg-background-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published':
                return 'Publié';
            case 'pending':
                return 'En attente';
            case 'rejected':
                return 'Rejeté';
            default:
                return status;
        }
    };

    const handleEditReview = (reviewId: string) => {
        dispatch(addNotification({
            type: 'info',
            message: 'Fonctionnalité d\'édition à venir',
            duration: 3000
        }));
    };

    const handleDeleteReview = (reviewId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
            dispatch(addNotification({
                type: 'success',
                message: 'Avis supprimé avec succès',
                duration: 3000
            }));
            setReviews(reviews.filter(r => r.id !== reviewId));
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-text-600'
                    }`}
            />
        ));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-text-400">Chargement de vos avis...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="text-error-400 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-text-100 mb-2">Erreur de chargement</h2>
                        <p className="text-text-400 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-100 mb-2">Mes avis</h1>
                    <p className="text-text-400">Gérez vos avis et évaluations sur les produits achetés</p>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-text-400 text-6xl mb-4">⭐</div>
                        <h2 className="text-2xl font-bold text-text-100 mb-2">Aucun avis</h2>
                        <p className="text-text-400 mb-6">Vous n'avez pas encore laissé d'avis sur vos achats</p>
                        <button
                            onClick={() => navigate('/downloads')}
                            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                            Voir mes téléchargements
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-background-800 rounded-2xl border border-background-700 p-6 hover:border-primary-500/30 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-background-700 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={review.productImage || '/placeholder-product.jpg'}
                                                alt={review.productTitle}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-text-100 mb-1">
                                                {review.productTitle}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <span className="text-sm text-text-400">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-text-300 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                                            {getStatusText(review.status)}
                                        </span>
                                        {review.status === 'published' && (
                                            <div className="flex items-center gap-1 text-sm text-text-400">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>{review.helpful} utile{review.helpful > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-background-700">
                                    <button
                                        onClick={() => handleEditReview(review.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-error-500/10 hover:bg-error-500/20 text-error-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </button>
                                    <button
                                        onClick={() => navigate(`/product/${review.productId}`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-background-700 hover:bg-background-600 text-text-200 rounded-lg transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Voir le produit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {reviews.length > 0 && (
                    <div className="mt-8 bg-background-800 rounded-2xl border border-background-700 p-6">
                        <h3 className="text-lg font-semibold text-text-100 mb-4">Statistiques</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-text-100 mb-1">
                                    {reviews.length}
                                </div>
                                <div className="text-sm text-text-400">Avis total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-text-100 mb-1">
                                    {reviews.filter(r => r.status === 'published').length}
                                </div>
                                <div className="text-sm text-text-400">Publiés</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-text-100 mb-1">
                                    {Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length * 10) / 10}
                                </div>
                                <div className="text-sm text-text-400">Note moyenne</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReviewsPage;