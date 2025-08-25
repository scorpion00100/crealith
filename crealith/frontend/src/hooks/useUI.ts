import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setLoading,
  toggleMobileMenu,
  closeMobileMenu,
  setSearchQuery,
  clearSearchQuery,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  setCurrentPage,
  setBreadcrumbs,
  setShowSearchResults,
} from '@/store/slices/uiSlice';

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);

  const showLoading = useCallback((loading: boolean) => {
    dispatch(setLoading(loading));
  }, [dispatch]);

  const openMobileMenu = useCallback(() => {
    dispatch(toggleMobileMenu());
  }, [dispatch]);

  const closeMobileMenuHandler = useCallback(() => {
    dispatch(closeMobileMenu());
  }, [dispatch]);

  const updateSearchQuery = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchQuery());
  }, [dispatch]);

  const showNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration?: number
  ) => {
    dispatch(addNotification({ type, message, duration }));
  }, [dispatch]);

  const hideNotification = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const changeTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch(setTheme(theme));
    localStorage.setItem('crealith_theme', theme);
  }, [dispatch]);

  const navigateTo = useCallback((page: string) => {
    dispatch(setCurrentPage(page));
    dispatch(closeMobileMenu());
  }, [dispatch]);

  const updateBreadcrumbs = useCallback((breadcrumbs: Array<{ label: string; path: string }>) => {
    dispatch(setBreadcrumbs(breadcrumbs));
  }, [dispatch]);

  const toggleSearchResults = useCallback((show: boolean) => {
    dispatch(setShowSearchResults(show));
  }, [dispatch]);

  return {
    ...ui,
    showLoading,
    openMobileMenu,
    closeMobileMenu: closeMobileMenuHandler,
    updateSearchQuery,
    clearSearch,
    showNotification,
    hideNotification,
    clearAllNotifications,
    changeTheme,
    navigateTo,
    updateBreadcrumbs,
    toggleSearchResults,
  };
};