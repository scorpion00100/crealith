import React, { useState } from 'react';
import { Product } from '@/types';
import { useAppSelector } from '@/store';
import { selectIsFavorite } from '@/store/slices/favoritesSlice';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onToggleFavorite?: (productId: string) => void;
    onPreview?: (product: Product) => void;
    isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onToggleFavorite,
    onPreview,
    isFavorite: propIsFavorite
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const isFavorite = useAppSelector(state => selectIsFavorite(state, product.id)) || propIsFavorite;

    const handleAddToCart = async () => {
        if (onAddToCart) {
            setIsLoading(true);
            try {
                await onAddToCart(product);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleToggleFavorite = () => {
        if (onToggleFavorite) {
            onToggleFavorite(String(product.id));
        }
    };

    const handlePreview = () => {
        if (onPreview) {
            onPreview(product);
        }
    };

    const renderStars = (rating: number): JSX.Element[] => {
        const stars = [];
        const safeRating = isNaN(rating) ? 0 : rating;
        const fullStars = Math.floor(safeRating);
        const hasHalfStar = safeRating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star filled">⭐</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star half">⭐</span>);
        }

        const emptyStars = 5 - Math.ceil(safeRating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
        }

        return stars;
    };

    // ✅ Image avec fallback
    const imageUrl =
        product.image ||
        product.thumbnailUrl ||
        "https://via.placeholder.com/400x300?text=No+Image";

    // ✅ Données sécurisées
    const safeTitle = product.title || "Produit sans titre";
    const safeRating = product.rating ?? 0;
    const safeReviews = product.reviews ?? 0;
    const safePrice = product.price ?? "Gratuit";
    const safeOriginalPrice = product.originalPrice ?? null;
    const safeDownloads = product.downloads ?? product.downloadsCount ?? 0;
    const safeAuthor = product.user
        ? `${product.user.firstName ?? ""} ${product.user.lastName ?? ""}`.trim()
        : product.author ?? "Auteur inconnu";

    return (
        <div className="product-card">
            <div className="product-image">
                <img
                    src={imageUrl}
                    alt={safeTitle}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                />

                {/* Badges */}
                <div className="product-badges">
                    {product.popular && <span className="badge popular">Populaire</span>}
                    {product.new && <span className="badge new">Nouveau</span>}
                    {product.trending && (
                        <span className="badge trending">Tendance</span>
                    )}
                    {product.discount && (
                        <span className="badge discount">-{product.discount}%</span>
                    )}
                </div>

                {/* Favoris */}
                <button
                    className={`favorite-btn ${isFavorite ? "active" : ""}`}
                    onClick={handleToggleFavorite}
                    aria-label="Ajouter aux favoris"
                    type="button"
                >
                    {isFavorite ? "❤️" : "🤍"}
                </button>
            </div>

            <div className="product-content">
                {/* Rating */}
                <div className="product-rating">
                    <div className="stars">{renderStars(safeRating)}</div>
                    <span className="rating-text">
                        {safeRating} ({safeReviews.toLocaleString()} avis)
                    </span>
                </div>

                {/* Titre */}
                <h3 className="product-title">{safeTitle}</h3>

                {/* Auteur */}
                <p className="product-author">par {safeAuthor}</p>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                        {product.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Prix & téléchargements */}
                <div className="product-footer">
                    <div className="price-container">
                        {safeOriginalPrice && (
                            <span className="original-price">{safeOriginalPrice}</span>
                        )}
                        <span className="current-price">{safePrice}</span>
                    </div>

                    {safeDownloads > 0 && (
                        <div className="download-count">
                            <span className="download-icon">📥</span>
                            {safeDownloads.toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="product-actions">
                    <button
                        className="btn-buy"
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        aria-label={`Acheter ${safeTitle}`}
                        type="button"
                    >
                        {isLoading ? "Ajout..." : "Acheter"}
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={handlePreview}
                        aria-label={`Aperçu de ${safeTitle}`}
                        type="button"
                    >
                        Aperçu
                    </button>
                </div>
            </div>
        </div>
    );
};
