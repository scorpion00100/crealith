import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchProducts,
  fetchProductById,
  setSelectedProduct,
  setFilters,
  clearFilters,
  searchProducts,
  clearSearchResults,
  clearError,
} from '@/store/slices/productSlice';
import { ProductFilters, Product } from '@/types';

export const useProducts = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    selectedProduct,
    categories,
    filters,
    pagination,
    isLoading,
    error,
    searchResults,
    isSearching,
  } = useAppSelector((state) => state.products);

  const loadProducts = useCallback((productFilters?: ProductFilters) => {
    dispatch(fetchProducts(productFilters || filters));
  }, [dispatch, filters]);

  const loadProductById = useCallback((id: string) => {
    dispatch(fetchProductById(id));
  }, [dispatch]);

  const searchProductsQuery = useCallback((query: string) => {
    dispatch(searchProducts(query));
  }, [dispatch]);

  const selectProduct = useCallback((product: Product | null) => {
    dispatch(setSelectedProduct(product));
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearProductError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [products.length, loadProducts]);

  return {
    products,
    selectedProduct,
    categories,
    filters,
    pagination,
    isLoading,
    error,
    searchResults,
    isSearching,
    loadProducts,
    loadProductById,
    searchProducts: searchProductsQuery,
    selectProduct,
    updateFilters,
    resetFilters,
    clearError: clearProductError,
    clearSearchResults: clearSearch,
  };
};