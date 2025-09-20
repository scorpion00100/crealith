import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';

interface AuthInitializerProps {
    children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        // Initialiser l'authentification au démarrage
        dispatch(initializeAuth());
    }, [dispatch]);

    // Afficher un loader pendant l'initialisation
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Initialisation...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
