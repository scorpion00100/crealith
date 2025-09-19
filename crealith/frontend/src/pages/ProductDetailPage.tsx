import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '@/store/slices/productSlice';
import { addToCartAsync, fetchCart } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '@/store/slices/favoritesSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { Star, Download, Heart, Share2, Eye, ShoppingCart } from 'lucide-react';
import { reviewService, ReviewItem } from '@/services/review.service';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAuth();

    const { currentProduct, isLoading } = useAppSelector(state => state.products);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'details'>('overview');
    const [topReviews, setTopReviews] = useState<ReviewItem[]>([]);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        (async () => {
            if (!id) return;
            try {
                // Récupère les 5 derniers avis (trié par createdAt desc côté API)
                const data = await reviewService.getProductReviews(id, 1, 5);
                setTopReviews(data.reviews || []);
            } catch (e) {
                // Silencieux pour MVP si API non dispo
            }
        })();
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour ajouter au panier',
                duration: 4000
            }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        try {
            await dispatch(addToCartAsync({ productId: id!, quantity: 1 })).unwrap();
            // Synchroniser le panier après l'ajout
            await dispatch(fetchCart()).unwrap();
            dispatch(addNotification({
                type: 'success',
                message: 'Produit ajouté au panier !',
                duration: 3000
            }));
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors de l\'ajout au panier',
                duration: 4000
            }));
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour ajouter aux favoris',
                duration: 4000
            }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        try {
            if (!isFavorite) {
                await dispatch(addFavoriteAsync(id!)).unwrap();
                setIsFavorite(true);
                dispatch(addNotification({ type: 'success', message: 'Ajouté aux favoris', duration: 2000 }));
            } else {
                await dispatch(removeFavoriteAsync(id!)).unwrap();
                setIsFavorite(false);
                dispatch(addNotification({ type: 'info', message: 'Retiré des favoris', duration: 2000 }));
            }
        } catch (error) {
            dispatch(addNotification({ type: 'error', message: 'Erreur favoris', duration: 3000 }));
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour acheter',
                duration: 4000
            }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        // Ajouter au panier et rediriger vers checkout
        handleAddToCart();
        setTimeout(() => navigate('/checkout'), 1000);
    };

    const handleDownload = () => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour télécharger',
                duration: 4000
            }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        // Vérifier si l'utilisateur a acheté le produit
        if (!currentProduct?.hasPurchased) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Vous devez acheter ce produit pour le télécharger',
                duration: 4000
            }));
            return;
        }

        // Télécharger le fichier
        window.open(currentProduct.fileUrl, '_blank');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: currentProduct?.title,
                text: currentProduct?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            dispatch(addNotification({
                type: 'success',
                message: 'Lien copié dans le presse-papiers',
                duration: 2000
            }));
        }
    };

    if (isLoading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner">Chargement du produit...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentProduct) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="error-container">
                        <h2>Produit non trouvé</h2>
                        <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/catalog')}>
                            Retour au catalogue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const images = [
        currentProduct.thumbnailUrl,
        currentProduct.image,
        // Ajouter plus d'images si disponibles
    ].filter(Boolean);

    const averageRating = currentProduct.averageRating || currentProduct.rating || 0;
    const totalReviews = currentProduct.totalReviews || currentProduct.reviewCount || 0;

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <a href="/">Accueil</a>
                    <span>/</span>
                    <a href="/catalog">Catalogue</a>
                    <span>/</span>
                    <a href={`/catalog?category=${currentProduct.category?.slug}`}>
                        {currentProduct.category?.name}
                    </a>
                    <span>/</span>
                    <span>{currentProduct.title}</span>
                </nav>

                <div className="product-detail-content">
                    {/* Galerie d'images */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img
                                src={images[selectedImage] || currentProduct.thumbnailUrl}
                                alt={currentProduct.title}
                                className="product-image"
                            />
                            <div className="image-overlay">
                                <button className="btn-icon" onClick={handleShare}>
                                    <Share2 size={20} />
                                </button>
                                <button className="btn-icon" onClick={handleToggleFavorite}>
                                    <Heart size={20} className={isFavorite ? 'filled' : ''} />
                                </button>
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="image-thumbnails">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={image} alt={`Vue ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Informations produit */}
                    <div className="product-info">
                        <div className="product-header">
                            <h1 className="product-title">{currentProduct.title}</h1>
                            <div className="product-meta">
                                <div className="product-author">
                                    par{' '}
                                    <a href={`/profile/${currentProduct.user?.id}`}>
                                        {currentProduct.user?.firstName} {currentProduct.user?.lastName}
                                    </a>
                                </div>
                                <div className="product-category">
                                    dans <a href={`/catalog?category=${currentProduct.category?.slug}`}>
                                        {currentProduct.category?.name}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Rating et reviews */}
                        <div className="product-rating">
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={20}
                                        className={star <= averageRating ? 'filled' : 'empty'}
                                    />
                                ))}
                            </div>
                            <span className="rating-text">
                                {averageRating.toFixed(1)} ({totalReviews} avis)
                            </span>
                        </div>

                        {/* Prix */}
                        <div className="product-pricing">
                            {currentProduct.originalPrice && (
                                <span className="original-price">
                                    {currentProduct.originalPrice} €
                                </span>
                            )}
                            <span className="current-price">{currentProduct.price} €</span>
                            {currentProduct.originalPrice && (
                                <span className="discount">
                                    -{Math.round(((parseFloat(currentProduct.originalPrice) - parseFloat(currentProduct.price)) / parseFloat(currentProduct.originalPrice)) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="product-actions">
                            <button className="btn btn-primary btn-large" onClick={handleAddToCart}>
                                <ShoppingCart size={20} />
                                Ajouter au panier
                            </button>
                            <button className="btn btn-secondary btn-large" onClick={handleBuyNow}>
                                Acheter maintenant
                            </button>
                            {currentProduct.hasPurchased && (
                                <button className="btn btn-outline" onClick={handleDownload}>
                                    <Download size={20} />
                                    Télécharger
                                </button>
                            )}
                        </div>

                        {/* Signaux de confiance */}
                        <div className="product-stats">
                            <div className="stat">
                                <span className="stat-label">Téléchargements</span>
                                <span className="stat-value">{currentProduct.downloadsCount?.toLocaleString()}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Mise à jour</span>
                                <span className="stat-value">
                                    {currentProduct.updatedAt ? new Date(currentProduct.updatedAt).toLocaleDateString('fr-FR') : '—'}
                                </span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Ventes</span>
                                <span className="stat-value">{currentProduct.totalSales?.toLocaleString()}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Taille</span>
                                <span className="stat-value">
                                    {currentProduct.fileSize ? `${(currentProduct.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Tags */}
                        {currentProduct.tags && currentProduct.tags.length > 0 && (
                            <div className="product-tags">
                                {currentProduct.tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Onglets de contenu */}
                <div className="product-tabs">
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Aperçu
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Avis ({totalReviews})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Détails
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'overview' && (
                            <div className="overview-tab">
                                <div className="product-description">
                                    <h3>Description</h3>
                                    <div className={`description-content ${showFullDescription ? 'expanded' : ''}`}>
                                        {currentProduct.description}
                                    </div>
                                    {currentProduct.description && currentProduct.description.length > 200 && (
                                        <button
                                            className="btn-link"
                                            onClick={() => setShowFullDescription(!showFullDescription)}
                                        >
                                            {showFullDescription ? 'Voir moins' : 'Voir plus'}
                                        </button>
                                    )}
                                </div>

                                {currentProduct.shortDescription && (
                                    <div className="product-short-description">
                                        <h3>Résumé</h3>
                                        <p>{currentProduct.shortDescription}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="reviews-tab">
                                <div className="reviews-header">
                                    <h3>Avis clients</h3>
                                    {currentProduct.hasPurchased && (
                                        <button className="btn btn-primary">
                                            Laisser un avis
                                        </button>
                                    )}
                                </div>

                                {totalReviews > 0 && topReviews.length > 0 ? (
                                    <div className="reviews-list space-y-4">
                                        {topReviews.map((r) => (
                                            <div key={r.id} className="p-4 bg-background-800 border border-background-700 rounded-xl">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-background-700 flex items-center justify-center text-sm font-semibold">
                                                        {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium">{r.user?.firstName} {r.user?.lastName}</div>
                                                            <div className="flex items-center">
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <Star key={s} size={14} className={s <= r.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {r.comment && (
                                                            <div className="text-sm text-text-300 mt-1">{r.comment}</div>
                                                        )}
                                                        <div className="text-xs text-text-500 mt-1">{new Date(r.createdAt as any).toLocaleDateString('fr-FR')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-reviews">
                                        <p>Aucun avis pour le moment</p>
                                        <p>Soyez le premier à laisser un avis !</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="details-tab">
                                <div className="product-details">
                                    <h3>Informations techniques</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Type de fichier</span>
                                            <span className="detail-value">{currentProduct.fileType}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Taille</span>
                                            <span className="detail-value">
                                                {currentProduct.fileSize ? `${(currentProduct.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Ce que vous recevez</span>
                                            <span className="detail-value">{Array.isArray((currentProduct as any).formats) ? ((currentProduct as any).formats as any).join(', ') : ((currentProduct as any).formats || currentProduct.fileType || 'Fichiers du produit')}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Date de publication</span>
                                            <span className="detail-value">
                                                {currentProduct.createdAt ? new Date(currentProduct.createdAt).toLocaleDateString('fr-FR') : '—'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Dernière mise à jour</span>
                                            <span className="detail-value">
                                                {currentProduct.updatedAt ? new Date(currentProduct.updatedAt).toLocaleDateString('fr-FR') : '—'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Licence</span>
                                            <span className="detail-value">{(currentProduct as any).license || 'Usage personnel et commercial (sauf revente en l’état)'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Produits similaires */}
                <div className="related-products">
                    <h3>Produits similaires</h3>
                    <div className="products-grid">
                        {/* Liste des produits similaires - à implémenter */}
                        <p>Produits similaires à venir</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
