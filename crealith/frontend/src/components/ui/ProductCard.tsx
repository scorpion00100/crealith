import React, { useState } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onToggleFavorite?: (productId: string) => void; // Changé de number à string
    onPreview?: (product: Product) => void;
    isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onToggleFavorite,
    onPreview,
    isFavorite = false
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
            onToggleFavorite(product.id);
        }
    };

    const handlePreview = () => {
        if (onPreview) {
            onPreview(product);
        }
    };

    const renderStars = (rating: number): JSX.Element[] => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star filled">⭐</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star half">⭐</span>);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
        }

        return stars;
    };

    // Utiliser l'image appropriée selon ce qui est disponible
    const imageUrl = product.image || product.thumbnailUrl || "https://via.placeholder.com/400x300?text=No+Image";

    return (
        <div className="product-card">
            <div className="product-image">
                <img
                    src={imageUrl}
                    alt={product.title}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                />

                {/* Badges */}
                <div className="product-badges">
                    {product.popular && (
                        <span className="badge popular">Populaire</span>
                    )}
                    {product.new && (
                        <span className="badge new">Nouveau</span>
                    )}
                    {product.trending && (
                        <span className="badge trending">Tendance</span>
                    )}
                    {product.discount && (
                        <span className="badge discount">-{product.discount}%</span>
                    )}
                </div>

                {/* Bouton favoris */}
                <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={handleToggleFavorite}
                    aria-label="Ajouter aux favoris"
                    type="button"
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>
            </div>

            <div className="product-content">
                {/* Rating */}
                <div className="product-rating">
                    <div className="stars">
                        {renderStars(product.rating)}
                    </div>
                    <span className="rating-text">
                        {product.rating} ({product.reviews.toLocaleString()} avis)
                    </span>
                </div>

                {/* Titre */}
                <h3 className="product-title">{product.title}</h3>

                {/* Auteur - utiliser les nouvelles données ou fallback */}
                <p className="product-author">
                    par {product.user ? `${product.user.firstName} ${product.user.lastName}` : product.author}
                </p>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                        {product.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Prix et téléchargements */}
                <div className="product-footer">
                    <div className="price-container">
                        {product.originalPrice && (
                            <span className="original-price">{product.originalPrice}</span>
                        )}
                        <span className="current-price">{product.price}</span>
                    </div>

                    {(product.downloads || product.downloadsCount) && (
                        <div className="download-count">
                            <span className="download-icon">📥</span>
                            {(product.downloads || product.downloadsCount || 0).toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="product-actions">
                    <button
                        className="btn-buy"
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        aria-label={`Acheter ${product.title}`}
                        type="button"
                    >
                        {isLoading ? 'Ajout...' : 'Acheter'}
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={handlePreview}
                        aria-label={`Aperçu de ${product.title}`}
                        type="button"
                    >
                        Aperçu
                    </button>
                </div>
            </div>
        </div>
    );
};
