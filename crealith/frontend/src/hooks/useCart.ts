import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  toggleCart,
  openCart,
  closeCart,
  clearCart,
  setLoading,
} from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { Product } from '@/types';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);

  const addItem = useCallback((product: Product) => {
    try {
      dispatch(addToCart(product));
      dispatch(addNotification({
        type: 'success',
        message: `${product.title} ajouté au panier !`,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Erreur lors de l\'ajout au panier',
      }));
    }
  }, [dispatch]);

  const removeItem = useCallback((productId: string) => {
    try {
      dispatch(removeFromCart(productId));
      dispatch(addNotification({
        type: 'success',
        message: 'Produit retiré du panier',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Erreur lors de la suppression',
      }));
    }
  }, [dispatch]);

  const updateItemQuantity = useCallback((id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  }, [dispatch]);

  const toggleCartSidebar = useCallback(() => {
    dispatch(toggleCart());
  }, [dispatch]);

  const openCartSidebar = useCallback(() => {
    dispatch(openCart());
  }, [dispatch]);

  const closeCartSidebar = useCallback(() => {
    dispatch(closeCart());
  }, [dispatch]);

  const clearCartItems = useCallback(() => {
    dispatch(clearCart());
    dispatch(addNotification({
      type: 'success',
      message: 'Panier vidé',
    }));
  }, [dispatch]);

  const setCartLoading = useCallback((loading: boolean) => {
    dispatch(setLoading(loading));
  }, [dispatch]);

  return {
    ...cart,
    addItem,
    removeItem,
    updateItemQuantity,
    toggleCartSidebar,
    openCartSidebar,
    closeCartSidebar,
    clearCartItems,
    setLoading: setCartLoading,
  };
};