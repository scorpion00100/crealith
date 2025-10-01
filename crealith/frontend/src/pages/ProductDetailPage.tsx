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
import { analyticsService } from '@/services/analytics.service';
import { productService } from '@/services/product.service';
import { setCurrentProduct } from '@/store/slices/productSlice';
import '../styles/pages/product-detail.css'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAuth();

    const { currentProduct, isLoading } = useAppSelector(state => state.products);
    const allProducts = useAppSelector(state => state.products.items);
    const { cart } = useAppSelector((state: any) => ({ cart: state.cart }));
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'details'>('overview');
    const [topReviews, setTopReviews] = useState<ReviewItem[]>([]);
    const [newRating, setNewRating] = useState<number>(0);
    const [newComment, setNewComment] = useState<string>('');
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
    const [fallbackPending, setFallbackPending] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [id, dispatch]);

    // Backend fallback fetch on refresh if product missing
    useEffect(() => {
        (async () => {
            if (!id) return;
            if (currentProduct) return;
            try {
                setFallbackPending(true);
                const fromApi = await productService.getProductById(id);
                if (fromApi) {
                    dispatch(setCurrentProduct(fromApi));
                }
            } catch { }
            finally {
                setFallbackPending(false);
            }
        })();
    }, [id, currentProduct, dispatch]);

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

    // Sync recently viewed with backend when authenticated
    useEffect(() => {
        (async () => {
            if (!currentProduct?.id) return;
            if (!isAuthenticated) return;
            try {
                await analyticsService.addRecentlyViewed(currentProduct.id);
            } catch { }
        })();
    }, [currentProduct?.id, isAuthenticated]);

    useEffect(() => {
        // Scroll to top when navigating to a product detail
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [id]);

    useEffect(() => {
        // After loading completes and product is set, ensure we're at the top
        if (!isLoading && !fallbackPending) {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [isLoading, fallbackPending]);

    const handleAddToCart = async () => {
        if (!currentProduct || !id) {
            dispatch(addNotification({
                type: 'error',
                message: 'Produit non trouvé',
                duration: 3000
            }));
            return;
        }

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
            await dispatch(addToCartAsync({ productId: id, quantity: 1 })).unwrap();
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
            dispatch(addNotification({ type: 'warning', message: 'Connectez-vous pour télécharger', duration: 4000 }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        if (!currentProduct) {
            dispatch(addNotification({ type: 'error', message: 'Produit introuvable', duration: 3000 }));
            return;
        }

        if (!currentProduct.hasPurchased) {
            // Rediriger vers le paiement: si déjà au panier, aller checkout, sinon ajouter puis checkout
            const alreadyInCart = cart.items?.some((it: any) => it.productId === currentProduct.id);
            const goCheckout = () => navigate('/checkout');
            if (alreadyInCart) {
                dispatch(addNotification({ type: 'info', message: 'Le produit est dans votre panier', duration: 2500 }));
                goCheckout();
                return;
            }
            (async () => {
                try {
                    await dispatch(addToCartAsync({ productId: currentProduct.id, quantity: 1 })).unwrap();
                    await dispatch(fetchCart()).unwrap();
                    dispatch(addNotification({ type: 'success', message: 'Ajouté au panier, redirection vers le paiement', duration: 2500 }));
                    goCheckout();
                } catch (e: any) {
                    dispatch(addNotification({ type: 'error', message: e?.message || 'Impossible d\'ajouter au panier', duration: 3000 }));
                }
            })();
            return;
        }

        // Télécharger le fichier si acheté
        if (currentProduct.fileUrl) {
            window.open(currentProduct.fileUrl, '_blank');
        } else {
            dispatch(addNotification({ type: 'error', message: 'Fichier indisponible', duration: 3000 }));
        }
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

    const handleLeaveReview = () => {
        if (!isAuthenticated) {
            dispatch(addNotification({ type: 'warning', message: 'Connectez-vous pour laisser un avis', duration: 3000 }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }
        if (!currentProduct?.hasPurchased) {
            dispatch(addNotification({ type: 'warning', message: 'Vous devez acheter le produit pour laisser un avis', duration: 3000 }));
            return;
        }
        navigate(`/my-reviews?product=${id}`);
    };

    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            dispatch(addNotification({ type: 'warning', message: 'Connectez-vous pour laisser un avis', duration: 3000 }));
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }
        if (!currentProduct?.hasPurchased) {
            dispatch(addNotification({ type: 'warning', message: 'Vous devez acheter le produit pour laisser un avis', duration: 3000 }));
            return;
        }
        if (!newRating) {
            dispatch(addNotification({ type: 'warning', message: 'Veuillez choisir une note', duration: 2500 }));
            return;
        }
        try {
            setIsSubmittingReview(true);
            await reviewService.createReview(currentProduct.id, newRating, newComment);
            setNewRating(0);
            setNewComment('');
            dispatch(addNotification({ type: 'success', message: 'Avis publié', duration: 2500 }));
            // Recharger un extrait d'avis
            if (id) {
                const data = await reviewService.getProductReviews(id, 1, 5);
                setTopReviews(data.reviews || []);
            }
        } catch (e: any) {
            dispatch(addNotification({ type: 'error', message: e?.message || 'Erreur lors de la publication', duration: 3000 }));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const scrollToReviews = () => {
        setActiveTab('reviews');
        setTimeout(() => {
            const el = document.getElementById('reviews-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    const similarProducts = (currentProduct && allProducts.length)
        ? allProducts
            .filter(p => p.id !== currentProduct.id && p.category?.slug === currentProduct.category?.slug)
            .slice(0, 12)
        : [];

    // Recently viewed tracking
    const RECENT_KEY = 'crealith_recently_viewed';
    useEffect(() => {
        if (!currentProduct?.id) return;
        try {
            const raw = localStorage.getItem(RECENT_KEY);
            const list: string[] = raw ? JSON.parse(raw) : [];
            const filtered = [currentProduct.id, ...list.filter((x) => x !== currentProduct.id)].slice(0, 12);
            localStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
        } catch { }
    }, [currentProduct?.id]);

    const getRecentlyViewed = (): typeof allProducts => {
        try {
            const raw = localStorage.getItem(RECENT_KEY);
            const ids: string[] = raw ? JSON.parse(raw) : [];
            const map = new Map(allProducts.map(p => [p.id, p] as const));
            return ids.map(id => map.get(id)).filter(Boolean) as any;
        } catch {
            return [] as any;
        }
    };

    // Build carousel list: prefer similar; fallback to recently viewed
    const baseCarousel = similarProducts.length > 0 ? similarProducts : getRecentlyViewed().filter(p => p.id !== currentProduct?.id);

    // Loop/duplicate items if fewer than 6 to make carousel feel rich
    const buildLooped = (items: typeof allProducts, minLen = 6, maxLen = 12) => {
        if (items.length === 0) return [] as typeof allProducts;
        if (items.length >= minLen) return items.slice(0, maxLen);
        const out: any[] = [];
        let i = 0;
        while (out.length < minLen) {
            out.push(items[i % items.length]);
            i++;
        }
        return out.slice(0, maxLen);
    };

    const carouselItems = buildLooped(baseCarousel);

    const scrollSimilar = (direction: 'left' | 'right') => {
        const scroller = document.getElementById('similar-scroller');
        if (scroller) scroller.scrollBy({ left: direction === 'left' ? -360 : 360, behavior: 'smooth' });
    };

    if (isLoading || fallbackPending) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner text="Chargement du produit..." />
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
        <div className="product-detail-page animate-in-down">
            <div className="product-detail-container">
                {/* Breadcrumb removed per request */}

                <div className="product-detail-layout">
                    {/* Galerie d'images */}
                    <div className="product-gallery animate-in-down" style={{ animationDelay: '60ms' }}>
                        <div className="gallery-main">
                            <img
                                src={images[selectedImage] || currentProduct.thumbnailUrl}
                                alt={currentProduct.title}
                                className="gallery-main-image"
                            />
                            <div className="gallery-zoom-overlay">
                                <button className="btn-icon" onClick={handleShare}>
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="gallery-thumbnails">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`gallery-thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={image} alt={`Vue ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Informations produit */}
                    <div className="product-info animate-in-down" style={{ animationDelay: '120ms' }}>
                        <div className="product-header">
                            <div className="product-category">
                                {currentProduct.category?.name}
                            </div>
                            <h1 className="product-title">{currentProduct.title}</h1>
                            <div className="product-author">
                                <div className="author-avatar">
                                    {(currentProduct.user?.firstName?.[0] || '')}{(currentProduct.user?.lastName?.[0] || '')}
                                </div>
                                <div className="author-info">
                                    <div className="author-name">
                                        par <button type="button" className="btn-link" onClick={() => navigate(`/profile/${currentProduct.user?.id}`)}>{currentProduct.user?.firstName} {currentProduct.user?.lastName}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rating et reviews */}
                        <div className="product-rating" role="button" onClick={scrollToReviews} title="Voir les avis" style={{ cursor: 'pointer' }}>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={`rating-star ${star <= averageRating ? 'filled' : ''}`}>★</span>
                                ))}
                            </div>
                            <span className="rating-value">{averageRating.toFixed(1)}</span>
                            <span className="rating-count">({totalReviews} avis)</span>
                        </div>
                        <div className="text-sm" style={{ marginTop: '-0.25rem' }}>
                            <button className="btn-link" onClick={scrollToReviews}>Voir les avis</button>
                        </div>

                        {/* Prix */}
                        <div className="product-pricing">
                            <div className="price-row">
                                <span className="price-label">Prix actuel</span>
                                <span className="price-current">{currentProduct.price} €</span>
                            </div>
                            {currentProduct.originalPrice && (
                                <>
                                    <div className="price-row">
                                        <span className="price-label">Prix d'origine</span>
                                        <span className="price-original">{currentProduct.originalPrice} €</span>
                                    </div>
                                    <div className="price-row">
                                        <span className="price-label">Réduction</span>
                                        <span className="price-discount">
                                            -{Math.round(((parseFloat(currentProduct.originalPrice) - parseFloat(currentProduct.price)) / parseFloat(currentProduct.originalPrice)) * 100)}%
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="product-actions">
                            <button className="action-button primary" onClick={handleAddToCart}>
                                <ShoppingCart size={20} />
                                Ajouter au panier
                            </button>
                            <button className="action-button secondary" onClick={handleBuyNow}>
                                Acheter maintenant
                            </button>
                            <button
                                className={`action-button favorite ${isFavorite ? 'active' : ''}`}
                                onClick={handleToggleFavorite}
                                aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            >
                                <Heart size={20} />
                            </button>
                        </div>
                        {!currentProduct.hasPurchased && (
                            <></>
                        )}

                        {/* Signaux / stats */}
                        <div className="product-details">
                            <h3 className="details-title">Informations</h3>
                            <div className="details-list">
                                <div className="detail-item">
                                    <span className="detail-label">Téléchargements</span>
                                    <span className="detail-value">{currentProduct.downloadsCount?.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Mise à jour</span>
                                    <span className="detail-value">{currentProduct.updatedAt ? new Date(currentProduct.updatedAt).toLocaleDateString('fr-FR') : '—'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Ventes</span>
                                    <span className="detail-value">{currentProduct.totalSales?.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Taille</span>
                                    <span className="detail-value">{currentProduct.fileSize ? `${(currentProduct.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Type de fichier</span>
                                    <span className="detail-value">{currentProduct.fileType}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="product-description animate-in-down" style={{ animationDelay: '180ms' }}>
                    <h3 className="description-title">Description</h3>
                    <div className="description-content">
                        <p>{currentProduct.description}</p>
                    </div>
                </div>

                {/* Résumé */}
                {currentProduct.shortDescription && (
                    <div className="product-description animate-in-down" style={{ animationDelay: '200ms' }}>
                        <h3 className="description-title">Résumé</h3>
                        <div className="description-content">
                            <p>{currentProduct.shortDescription}</p>
                        </div>
                    </div>
                )}

                {/* Avis */}
                <div className="product-reviews animate-in-down" style={{ animationDelay: '220ms' }} id="reviews-section">
                    <div className="reviews-header" onClick={scrollToReviews} style={{ cursor: 'pointer' }}>
                        <h3 className="reviews-title">Avis</h3>
                        <button
                            className="action-button secondary"
                            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.9rem' }}
                            onClick={(e) => { e.stopPropagation(); handleLeaveReview(); }}
                            title="Aller à la page de mes avis pour ce produit"
                        >
                            Laisser un avis
                        </button>
                    </div>

                    {/* Eligibility hint */}
                    {(!isAuthenticated || !currentProduct?.hasPurchased) && (
                        <div className="text-sm text-text-400" style={{ marginBottom: '0.75rem' }}>
                            Vous devez être connecté et avoir acheté pour laisser un avis.
                            {!isAuthenticated && (
                                <>
                                    {' '}<button className="btn-link" onClick={() => navigate('/login?redirect=' + window.location.pathname)}>Se connecter</button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Inline Review Form */}
                    {(isAuthenticated && currentProduct?.hasPurchased) && (
                        <div className="review-item" style={{ marginBottom: '1rem' }}>
                            <div className="review-content">
                                <div className="flex items-center gap-2 mb-3">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} onClick={() => setNewRating(s)} className={s <= newRating ? 'text-yellow-400' : 'text-gray-600'} title={`${s} étoiles`}>★</button>
                                    ))}
                                </div>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Écrivez votre avis (optionnel)"
                                    className="w-full bg-transparent border border-gray-700 rounded-xl p-3 text-gray-200"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        className="action-button secondary"
                                        style={{ width: 'auto', padding: '8px 12px', fontSize: '0.9rem' }}
                                        onClick={handleSubmitReview}
                                        disabled={isSubmittingReview || newRating === 0}
                                        title={newRating === 0 ? 'Choisissez une note' : 'Publier'}
                                    >
                                        {isSubmittingReview ? 'Publication…' : 'Publier l\'avis'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {totalReviews > 0 && topReviews.length > 0 ? (
                        <div className="reviews-list">
                            {topReviews.map((r) => (
                                <div key={r.id} className="review-item">
                                    <div className="review-header">
                                        <div className="review-author">
                                            <div className="review-author-avatar">
                                                {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                                            </div>
                                            <div className="review-author-name">{r.user?.firstName} {r.user?.lastName}</div>
                                        </div>
                                        <div className="review-rating">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={14} className={s <= r.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'} />
                                            ))}
                                        </div>
                                        <div className="review-date">{new Date(r.createdAt as any).toLocaleDateString('fr-FR')}</div>
                                    </div>
                                    {r.comment && (
                                        <div className="review-content">{r.comment}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="reviews-list">
                            <div className="review-item">
                                <div className="review-content">Aucun avis pour le moment.</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Produits similaires */}
                <div className="similar-products animate-in-down" style={{ animationDelay: '240ms' }}>
                    <div className="similar-products-header">
                        <h3 className="similar-products-title">{similarProducts.length > 0 ? 'Produits similaires' : 'Vu récemment'}</h3>
                        {carouselItems.length > 0 && (
                            <div className="flex gap-2">
                                <button className="action-button secondary" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => scrollSimilar('left')} aria-label="Précédent">◀</button>
                                <button className="action-button secondary" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => scrollSimilar('right')} aria-label="Suivant">▶</button>
                            </div>
                        )}
                    </div>
                    {carouselItems.length > 0 ? (
                        <div id="similar-scroller" className="similar-scroller">
                            <div className="similar-track">
                                {carouselItems.map((p) => (
                                    <div key={`${p.id}`} className="similar-item" role="button" onClick={() => navigate(`/product/${p.id}`)}>
                                        <div className="similar-thumb">
                                            <img src={p.thumbnailUrl || p.image} alt={p.title} />
                                        </div>
                                        <div className="similar-meta">
                                            <div className="similar-title" title={p.title}>{p.title}</div>
                                            <div className="similar-price">{p.price} €</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="similar-products-grid">
                            <p>Produits similaires à venir</p>
                        </div>
                    )}
                </div>

                {/* Barre d'achat mobile sticky */}
                <div className="mobile-buybar">
                    <div className="mobile-buybar-content">
                        <div className="mobile-buybar-price">
                            <span className="current">{currentProduct.price} €</span>
                            {currentProduct.originalPrice && (
                                <span className="original">{currentProduct.originalPrice} €</span>
                            )}
                        </div>
                        <div className="mobile-buybar-actions">
                            <button className={`mobile-fav ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite} aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                                ❤
                            </button>
                            <button className="mobile-add" onClick={handleAddToCart}>
                                Ajouter au panier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer intentionally omitted: provided by global layout */}
        </div>
    );
};
