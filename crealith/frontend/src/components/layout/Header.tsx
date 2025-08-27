import React, { useState, ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setSearchQuery } from '@/store/slices/uiSlice';
import { searchProducts } from '@/store/slices/productSlice';
import { logout } from '@/store/slices/authSlice';
import { toggleCart } from '@/store/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { NotificationCenter } from '@/components/ui/NotificationCenter';

export const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Sélecteurs Redux
    const { isAuthenticated, user } = useAppSelector(state => state.auth);
    const { totalItems } = useAppSelector(state => state.cart);
    const { searchQuery } = useAppSelector(state => state.ui);
    const favoritesCount = useAppSelector(state => state.favorites.favorites.length);

    // État local
    const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchQuery);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (localSearchTerm.trim()) {
            // Mettre à jour le store
            dispatch(setSearchQuery(localSearchTerm.trim()));
            dispatch(searchProducts(localSearchTerm.trim()));

            // Rediriger vers le catalogue si on n'y est pas déjà
            if (location.pathname !== '/catalog') {
                navigate(`/catalog?search=${encodeURIComponent(localSearchTerm.trim())}`);
            }
        } else {
            // Vider la recherche
            dispatch(setSearchQuery(''));
            dispatch(searchProducts(''));
        }
    };

    const handleLogoClick = () => {
        navigate('/');
        // Réinitialiser la recherche si on retourne à l'accueil
        if (searchQuery) {
            dispatch(setSearchQuery(''));
            setLocalSearchTerm('');
        }
    };

    const handleCartClick = () => {
        dispatch(toggleCart());
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-content">
                {/* Logo */}
                <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <div className="logo-icon">C</div>
                    <div className="logo-text">Crealith</div>
                </div>

                {/* Navigation */}
                <nav className="header-nav">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Accueil
                    </Link>
                    <Link
                        to="/catalog"
                        className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}
                    >
                        Catalogue
                    </Link>
                    {isAuthenticated && (
                        <Link
                            to="/dashboard"
                            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                    )}
                </nav>

                {/* Barre de recherche */}
                <form className="search-container" onSubmit={handleSearchSubmit}>
                    <div className="search-icon">
                        🔍
                    </div>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher des designs, templates et assets..."
                        value={localSearchTerm}
                        onChange={handleSearchChange}
                    />
                    <button type="submit" style={{ display: 'none' }} />
                </form>

                {/* Actions utilisateur */}
                <div className="header-actions">
                    {/* Panier */}
                    <button className="cart-btn" onClick={handleCartClick}>
                        🛒
                        {totalItems > 0 && (
                            <span className="cart-count">{totalItems}</span>
                        )}
                    </button>

                    {/* Favoris */}
                    <Link to="/favorites" className="favorites-btn">
                        ❤️
                        {favoritesCount > 0 && (
                            <span className="favorites-count">{favoritesCount}</span>
                        )}
                    </Link>

                    {/* Notifications */}
                    <NotificationCenter />

                    {/* État d'authentification */}
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <div className="user-info">
                                {user?.avatar && (
                                    <img
                                        src={user.avatar}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="user-avatar"
                                    />
                                )}
                                <span className="user-name">
                                    {user?.firstName} {user?.lastName}
                                </span>
                            </div>
                            <div className="user-dropdown">
                                <Link to="/profile" className="dropdown-item">
                                    👤 Profil
                                </Link>
                                <Link to="/dashboard" className="dropdown-item">
                                    📊 Dashboard
                                </Link>
                                <Link to="/orders" className="dropdown-item">
                                    📦 Mes commandes
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="dropdown-item logout-btn"
                                >
                                    🚪 Se déconnecter
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline">
                                Se connecter
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Créer un compte
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
