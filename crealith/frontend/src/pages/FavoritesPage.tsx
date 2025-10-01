import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFavorites, removeFromFavorites, removeFavoriteAsync } from '@/store/slices/favoritesSlice';
import { addToCartAsync } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { ProductCard } from '@/components/ui/ProductCard';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Product } from '@/types';

export const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAuth();

    const { items: favorites, isLoading } = useAppSelector(state => state.favorites);

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Connectez-vous pour voir vos favoris',
                duration: 4000
            }));
            navigate('/login?redirect=/favorites');
            return;
        }

        dispatch(fetchFavorites());
    }, [dispatch, isAuthenticated, navigate]);

    const handleAddToCart = async (productId: string) => {
        try {
            await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
            dispatch(addNotification({
                type: 'success',
                message: 'Produit ajouté au panier !',
                duration: 3000
            }));
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors de l\'ajout au panier',
                duration: 4000
            }));
        }
    };

    const handleToggleFavorite = async (productId: string) => {
        try {
            // Appel backend + mise à jour locale
            await dispatch(removeFavoriteAsync(productId));
            dispatch(addNotification({
                type: 'success',
                message: 'Produit retiré des favoris',
                duration: 3000
            }));
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors de la suppression des favoris',
                duration: 4000
            }));
        }
    };

    const handlePreview = (product: Product) => {
        navigate(`/product/${product.id}`);
    };

    const handleContinueShopping = () => {
        navigate('/catalog');
    };

    if (isLoading) {
        return (
            <div className="favorites-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner">Chargement de vos favoris...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page min-h-screen bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="favorites-header">
                    <button className="btn btn-primary btn-large" onClick={handleContinueShopping}>
                        <ArrowLeft size={20} />
                        Continuer les achats
                    </button>
                    <h1>Mes Favoris</h1>
                    <div className="favorites-count">
                        {favorites.length} produit{favorites.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="empty-favorites">
                        <div className="empty-favorites-icon">
                            <Heart size={64} />
                        </div>
                        <h2>Vous n'avez pas encore de favoris</h2>
                        <p>Découvrez nos produits et ajoutez-les à vos favoris pour les retrouver facilement</p>
                        <button className="btn btn-primary btn-large" onClick={handleContinueShopping}>
                            Explorer le catalogue
                        </button>
                    </div>
                ) : (
                    <div className="favorites-content">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {favorites.map((product: Product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    variant="minimal"
                                    isFavorite={true}
                                    onView={(id) => navigate(`/product/${id}`)}
                                    onAddToFavorites={handleToggleFavorite}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
