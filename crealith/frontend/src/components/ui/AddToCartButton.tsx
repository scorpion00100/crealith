import React from 'react';
import { useAppDispatch } from '@/store';
import { addToCartAsync, fetchCart } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle } from 'lucide-react';

interface AddToCartButtonProps {
    productId: string;
    productTitle?: string;
    isInCart?: boolean;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'outline' | 'ghost';
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    productId,
    productTitle = 'Produit',
    isInCart = false,
    disabled = false,
    className = '',
    size = 'md',
    variant = 'primary',
    onSuccess,
    onError
}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

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

        if (isInCart) {
            dispatch(addNotification({
                type: 'info',
                message: 'Ce produit est déjà dans votre panier',
                duration: 2000
            }));
            return;
        }

        try {
            await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
            // Synchroniser le panier après l'ajout
            await dispatch(fetchCart()).unwrap();

            dispatch(addNotification({
                type: 'success',
                message: `${productTitle} ajouté au panier !`,
                duration: 3000
            }));

            onSuccess?.();
        } catch (error: any) {
            const errorMessage = error.message || 'Erreur lors de l\'ajout au panier';
            dispatch(addNotification({
                type: 'error',
                message: errorMessage,
                duration: 4000
            }));
            onError?.(errorMessage);
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2 text-sm';
            case 'lg':
                return 'px-6 py-4 text-lg';
            default:
                return 'px-4 py-3 text-base';
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'outline':
                return 'border border-primary-500 text-primary-600 hover:bg-primary-50';
            case 'ghost':
                return 'text-primary-600 hover:bg-primary-50';
            default:
                return 'bg-primary-500 text-white hover:bg-primary-600';
        }
    };

    const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  `;

    const classes = `${baseClasses} ${getSizeClasses()} ${getVariantClasses()} ${className}`;

    return (
        <button
            onClick={handleAddToCart}
            disabled={disabled || isInCart}
            className={classes}
        >
            {isInCart ? (
                <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Dans le panier</span>
                </>
            ) : (
                <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Ajouter au panier</span>
                </>
            )}
        </button>
    );
};
