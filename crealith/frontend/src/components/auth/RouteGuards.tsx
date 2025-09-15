import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
    requireEmailVerification?: boolean;
    fallbackPath?: string;
}

interface PublicRouteProps {
    children: ReactNode;
    redirectTo?: string;
    allowAuthenticated?: boolean;
}

interface RoleBasedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
    fallbackPath?: string;
}

// Composant pour les routes protégées
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    requireEmailVerification = false,
    fallbackPath = '/login'
}) => {
    const { isAuthenticated, user, hasRole, isEmailVerified } = useAuth();
    const location = useLocation();

    // Vérifier l'authentification
    if (!isAuthenticated) {
        return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    // Vérifier la vérification d'email si requise
    if (requireEmailVerification && !isEmailVerified()) {
        return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }

    // Vérifier le rôle si requis
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

// Composant pour les routes publiques (redirige si déjà connecté)
export const PublicRoute: React.FC<PublicRouteProps> = ({
    children,
    redirectTo = '/dashboard',
    allowAuthenticated = false
}) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Si l'utilisateur est connecté et que la route n'autorise pas les utilisateurs connectés
    if (isAuthenticated && !allowAuthenticated) {
        // Récupérer l'URL d'origine depuis l'état de navigation
        const from = location.state?.from as string;
        const redirectUrl = from && from !== '/login' && from !== '/register' ? from : redirectTo;

        return <Navigate to={redirectUrl} replace />;
    }

    return <>{children}</>;
};

// Composant pour les routes basées sur les rôles
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
    children,
    allowedRoles,
    fallbackPath = '/unauthorized'
}) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Vérifier l'authentification
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Vérifier le rôle
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
};

// Composant pour les routes d'administration
export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <RoleBasedRoute allowedRoles={['ADMIN']} fallbackPath="/unauthorized">
            {children}
        </RoleBasedRoute>
    );
};

// Composant pour les routes de vendeur
export const SellerRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <RoleBasedRoute allowedRoles={['SELLER', 'ADMIN']} fallbackPath="/unauthorized">
            {children}
        </RoleBasedRoute>
    );
};

// Composant pour les routes d'acheteur
export const BuyerRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <RoleBasedRoute allowedRoles={['BUYER', 'ADMIN']} fallbackPath="/unauthorized">
            {children}
        </RoleBasedRoute>
    );
};

// Composant pour les routes nécessitant une vérification d'email
export const VerifiedEmailRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ProtectedRoute requireEmailVerification={true}>
            {children}
        </ProtectedRoute>
    );
};

// Hook pour vérifier les permissions dans les composants
export const useRoutePermissions = () => {
    const { user, isAuthenticated, hasRole, isEmailVerified } = useAuth();

    const canAccess = (requiredRole?: string, requireEmailVerification = false): boolean => {
        if (!isAuthenticated) return false;
        if (requireEmailVerification && !isEmailVerified()) return false;
        if (requiredRole && !hasRole(requiredRole)) return false;
        return true;
    };

    const canAccessAdmin = (): boolean => canAccess('ADMIN');
    const canAccessSeller = (): boolean => canAccess('SELLER');
    const canAccessBuyer = (): boolean => canAccess('BUYER');
    const canAccessVerified = (): boolean => canAccess(undefined, true);

    return {
        canAccess,
        canAccessAdmin,
        canAccessSeller,
        canAccessBuyer,
        canAccessVerified,
        user,
        isAuthenticated,
        hasRole,
        isEmailVerified,
    };
};
