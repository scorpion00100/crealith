import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { setCurrentPage, setBreadcrumbs } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    // Mettre à jour la page courante et les breadcrumbs
    useEffect(() => {
        const pathname = location.pathname;

        // Déterminer la page courante
        let currentPage = 'home';
        if (pathname.includes('/catalog')) currentPage = 'catalog';
        else if (pathname.includes('/dashboard')) currentPage = 'dashboard';
        else if (pathname.includes('/profile')) currentPage = 'profile';

        dispatch(setCurrentPage(currentPage));

        // Générer les breadcrumbs selon la route
        const breadcrumbs = [];

        if (pathname === '/') {
            breadcrumbs.push({ label: 'Accueil', path: '/' });
        } else if (pathname === '/catalog') {
            breadcrumbs.push({ label: 'Accueil', path: '/' });
            breadcrumbs.push({ label: 'Catalogue', path: '/catalog' });
        } else if (pathname === '/dashboard') {
            breadcrumbs.push({ label: 'Accueil', path: '/' });
            breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
        } else if (pathname.startsWith('/product/')) {
            breadcrumbs.push({ label: 'Accueil', path: '/' });
            breadcrumbs.push({ label: 'Catalogue', path: '/catalog' });
            breadcrumbs.push({ label: 'Produit', path: pathname });
        } else if (pathname === '/profile') {
            breadcrumbs.push({ label: 'Accueil', path: '/' });
            breadcrumbs.push({ label: 'Profil', path: '/profile' });
        }

        dispatch(setBreadcrumbs(breadcrumbs));
    }, [location.pathname, dispatch]);

    return (
        <div className="layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};
