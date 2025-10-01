import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProductById } from '@/store/slices/productSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { productService } from '@/services/product.service';
import { useAuth } from './useAuth';

export interface EditProductData {
  title: string;
  price: string;
  description: string;
  isActive: boolean;
}

export const useProductDetails = (productId: string | undefined) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { currentProduct, isLoading } = useAppSelector(state => state.products);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditProductData>({
    title: '',
    price: '',
    description: '',
    isActive: true
  });

  // Charger le produit
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  // Initialiser les données d'édition
  useEffect(() => {
    if (currentProduct) {
      setEditData({
        title: currentProduct.title || '',
        price: currentProduct.price?.toString() || '',
        description: currentProduct.description || '',
        isActive: currentProduct.isActive ?? true
      });
    }
  }, [currentProduct]);

  // Vérifier la propriété du produit
  useEffect(() => {
    if (currentProduct && user && !isLoading) {
      if (currentProduct.userId && user.id && currentProduct.userId !== user.id) {
        dispatch(addNotification({
          type: 'error',
          message: 'Vous ne pouvez pas accéder à ce produit',
          duration: 3000
        }));
        navigate('/seller-dashboard');
      }
    }
  }, [currentProduct, user, dispatch, navigate, isLoading]);

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
        message: 'Le prix doit être un nombre positif',
        duration: 3000
      }));
      return;
    }

    try {
      await productService.updateProduct(currentProduct.id, {
        ...editData,
        price: price.toString()
      });

      dispatch(addNotification({
        type: 'success',
        message: 'Produit mis à jour avec succès',
        duration: 3000
      }));

      setIsEditing(false);
      dispatch(fetchProductById(currentProduct.id));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de la mise à jour du produit',
        duration: 3000
      }));
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    try {
      await productService.deleteProduct(currentProduct.id);
      dispatch(addNotification({
        type: 'success',
        message: 'Produit supprimé avec succès',
        duration: 3000
      }));
      navigate('/seller-dashboard');
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de la suppression du produit',
        duration: 3000
      }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return {
    currentProduct,
    isLoading,
    selectedImage,
    setSelectedImage,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    handleEdit,
    handleDelete,
    formatPrice
  };
};

