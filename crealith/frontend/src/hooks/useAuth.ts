import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, registerUser, logout, clearError, fetchUserProfile } from '@/store/slices/authSlice';
import { LoginForm, RegisterForm } from '@/types';
import { useCallback, useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(async (credentials: LoginForm) => {
    try {
      const result = await dispatch(loginUser(credentials));
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const register = useCallback(async (userData: RegisterForm) => {
    try {
      const result = await dispatch(registerUser(userData));
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const refreshProfile = useCallback(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshProfile();
    }
  }, [isAuthenticated, user, refreshProfile]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: logoutUser,
    refreshProfile,
    clearError: clearAuthError,
  };
};