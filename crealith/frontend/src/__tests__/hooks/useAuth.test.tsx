import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '@/hooks/useAuth';
import authSlice from '@/store/slices/authSlice';

// Mock des services
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock des types
vi.mock('@/types', () => ({
  LoginForm: {},
  RegisterForm: {},
}));

describe('useAuth Hook', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it('should return initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle login successfully', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'BUYER',
    };

    const mockAuthResponse = {
      user: mockUser,
      token: 'mock-token',
    };

    const { authService } = require('@/services/auth.service');
    authService.login.mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle login failure', async () => {
    const { authService } = require('@/services/auth.service');
    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('should handle registration successfully', async () => {
    const mockUser = {
      id: 'user1',
      email: 'newuser@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'BUYER',
    };

    const mockAuthResponse = {
      user: mockUser,
      token: 'mock-token',
    };

    const { authService } = require('@/services/auth.service');
    authService.register.mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
    expect(authService.register).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
    });
  });

  it('should handle registration failure', async () => {
    const { authService } = require('@/services/auth.service');
    authService.register.mockRejectedValue(new Error('Email already exists'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.register({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Email already exists');
  });

  it('should handle logout', async () => {
    const { authService } = require('@/services/auth.service');
    authService.logout.mockResolvedValue(undefined);

    // First, set up an authenticated state
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'BUYER',
    };

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Simulate login first
    await act(async () => {
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: { user: mockUser, token: 'mock-token' },
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Now logout
    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should clear error when clearError is called', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set an error first
    await act(async () => {
      store.dispatch({
        type: 'auth/loginUser/rejected',
        payload: 'Login failed',
      });
    });

    expect(result.current.error).toBe('Login failed');

    // Clear the error
    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should refresh profile when authenticated but no user data', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'BUYER',
    };

    const { authService } = require('@/services/auth.service');
    authService.getProfile.mockResolvedValue(mockUser);

    // Set authenticated state without user data
    await act(async () => {
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: { user: null, token: 'mock-token' },
      });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // The hook should automatically fetch the profile
    await act(async () => {
      // Wait for the effect to run
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(authService.getProfile).toHaveBeenCalled();
  });

  it('should not refresh profile when not authenticated', async () => {
    const { authService } = require('@/services/auth.service');

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for any effects to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(authService.getProfile).not.toHaveBeenCalled();
  });

  it('should handle profile fetch failure', async () => {
    const { authService } = require('@/services/auth.service');
    authService.getProfile.mockRejectedValue(new Error('Profile fetch failed'));

    // Set authenticated state without user data
    await act(async () => {
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: { user: null, token: 'mock-token' },
      });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // The hook should automatically fetch the profile and handle the error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(authService.getProfile).toHaveBeenCalled();
    // The error should be handled gracefully
    expect(result.current.isAuthenticated).toBe(true);
  });
});
