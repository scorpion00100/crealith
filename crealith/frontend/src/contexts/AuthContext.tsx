import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, registerUser, logout, fetchUserProfile, clearError } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { LoginForm, RegisterForm, User } from '@/types';

interface AuthContextType {
    // État d'authentification
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions d'authentification
    login: (credentials: LoginForm) => Promise<void>;
    register: (userData: RegisterForm) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
    clearError: () => void;

    // Gestion des redirections
    redirectToLogin: (redirectUrl?: string) => void;
    redirectAfterLogin: (defaultPath?: string) => void;
    redirectToUnauthorized: () => void;

    // Utilitaires
    hasRole: (role: string) => boolean;
    isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

    // État local pour la gestion des redirections
    const [intendedUrl, setIntendedUrl] = useState<string | null>(null);

    // Sauvegarder l'URL d'origine quand l'utilisateur est redirigé vers login
    const redirectToLogin = (redirectUrl?: string) => {
        const currentPath = location.pathname + location.search;
        const targetUrl = redirectUrl || currentPath;

        // Ne pas sauvegarder si c'est déjà une page d'auth
        if (!targetUrl.includes('/login') && !targetUrl.includes('/register')) {
            setIntendedUrl(targetUrl);
            sessionStorage.setItem('intendedUrl', targetUrl);
        }

        navigate('/login', {
            state: { from: targetUrl },
            replace: true
        });
    };

    // Rediriger après connexion réussie
    const redirectAfterLogin = (defaultPath: string = '/dashboard') => {
        const savedUrl = sessionStorage.getItem('intendedUrl');
        const stateUrl = location.state?.from;
        const redirectUrl = savedUrl || stateUrl || defaultPath;

        // Nettoyer l'URL sauvegardée
        sessionStorage.removeItem('intendedUrl');
        setIntendedUrl(null);

        // Valider l'URL de redirection
        if (isValidRedirectUrl(redirectUrl)) {
            navigate(redirectUrl, { replace: true });
        } else {
            navigate(defaultPath, { replace: true });
        }
    };

    // Rediriger vers la page d'erreur d'autorisation
    const redirectToUnauthorized = () => {
        navigate('/unauthorized', { replace: true });
    };

    // Vérifier si l'utilisateur a un rôle spécifique
    const hasRole = (role: string): boolean => {
        return user?.role === role;
    };

    // Vérifier si l'email est vérifié
    const isEmailVerified = (): boolean => {
        return user?.emailVerified === true;
    };

    // Valider les URLs de redirection pour la sécurité
    const isValidRedirectUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url, window.location.origin);

            // Vérifier que c'est la même origine
            if (urlObj.origin !== window.location.origin) {
                return false;
            }

            // Liste des chemins interdits
            const forbiddenPaths = [
                '/login',
                '/register',
                '/forgot-password',
                '/reset-password',
                '/verify-email',
                '/email-confirmation'
            ];

            return !forbiddenPaths.some(path => urlObj.pathname.startsWith(path));
        } catch {
            return false;
        }
    };

    // Actions d'authentification avec gestion des redirections
    const login = async (credentials: LoginForm): Promise<void> => {
        try {
            const result = await dispatch(loginUser(credentials));

            if (loginUser.fulfilled.match(result)) {
                dispatch(addNotification({
                    type: 'success',
                    message: 'Connexion réussie !',
                    duration: 3000,
                }));

                // Rediriger après connexion
                redirectAfterLogin();
            }
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors de la connexion',
                duration: 4000,
            }));
            throw error;
        }
    };

    const register = async (userData: RegisterForm): Promise<void> => {
        try {
            const result = await dispatch(registerUser(userData));

            if (registerUser.fulfilled.match(result)) {
                dispatch(addNotification({
                    type: 'success',
                    message: 'Compte créé avec succès ! Vérifiez votre email pour activer votre compte.',
                    duration: 5000,
                }));

                // Rediriger vers la page de confirmation d'email
                navigate('/email-confirmation', {
                    state: { email: userData.email },
                    replace: true
                });
            }
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors de la création du compte',
                duration: 4000,
            }));
            throw error;
        }
    };

    const logoutUser = (): void => {
        dispatch(logout());
        dispatch(addNotification({
            type: 'info',
            message: 'Déconnexion réussie',
            duration: 3000,
        }));

        // Nettoyer les données de session
        sessionStorage.clear();
        setIntendedUrl(null);

        // Rediriger vers la page d'accueil
        navigate('/', { replace: true });
    };

    const refreshProfile = async (): Promise<void> => {
        if (isAuthenticated && !user) {
            try {
                await dispatch(fetchUserProfile());
            } catch (error) {
                console.error('Erreur lors du rafraîchissement du profil:', error);
            }
        }
    };

    const clearAuthError = (): void => {
        dispatch(clearError());
    };

    // Vérifier l'authentification au chargement
    useEffect(() => {
        if (isAuthenticated && !user) {
            refreshProfile();
        }
    }, [isAuthenticated, user]);

    // Gérer les redirections automatiques
    useEffect(() => {
        // Si l'utilisateur est connecté et sur une page d'auth, rediriger
        if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
            redirectAfterLogin();
        }

        // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
        if (!isAuthenticated && isProtectedRoute(location.pathname)) {
            redirectToLogin();
        }
    }, [isAuthenticated, location.pathname]);

    // Déterminer si une route est protégée
    const isProtectedRoute = (pathname: string): boolean => {
        const protectedRoutes = [
            '/dashboard',
            '/profile',
            '/settings',
            '/orders',
            '/favorites',
            '/cart',
            '/checkout',
            '/seller',
            '/admin'
        ];

        return protectedRoutes.some(route => pathname.startsWith(route));
    };

    const contextValue: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout: logoutUser,
        refreshProfile,
        clearError: clearAuthError,
        redirectToLogin,
        redirectAfterLogin,
        redirectToUnauthorized,
        hasRole,
        isEmailVerified,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Hook pour la navigation protégée
export const useProtectedNavigation = () => {
    const { isAuthenticated, hasRole, isEmailVerified, redirectToLogin, redirectToUnauthorized } = useAuth();

    const requireAuth = (redirectUrl?: string) => {
        if (!isAuthenticated) {
            redirectToLogin(redirectUrl);
            return false;
        }
        return true;
    };

    const requireRole = (role: string, redirectUrl?: string) => {
        if (!requireAuth(redirectUrl)) return false;

        if (!hasRole(role)) {
            redirectToUnauthorized();
            return false;
        }
        return true;
    };

    const requireEmailVerification = (redirectUrl?: string) => {
        if (!requireAuth(redirectUrl)) return false;

        if (!isEmailVerified()) {
            // Rediriger vers la page de vérification d'email
            window.location.href = '/verify-email';
            return false;
        }
        return true;
    };

    return {
        requireAuth,
        requireRole,
        requireEmailVerification,
    };
};
