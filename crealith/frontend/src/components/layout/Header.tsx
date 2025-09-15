import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { SearchBar } from '@/components/ui/SearchBar';
import {
  Home,
  Grid3X3,
  Info,
  Mail,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Bell,
  Settings
} from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const { items: cartItems } = useAppSelector(state => state.cart);

  const cartItemsCount = cartItems.length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-md border-b border-gray-700/50 shadow-medium">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Section gauche ultra-compacte */}
          <div className="flex items-center flex-shrink-0 mr-1">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-accent-500 to-secondary-500 rounded-full animate-pulse-soft"></div>
              </div>
              <span className="text-xl font-black text-gradient-primary">Crealith</span>
            </Link>
          </div>

          {/* Navigation Desktop - Section centrale ultra-compacte */}
          <nav className="hidden lg:flex items-center space-x-2 mx-1">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-all duration-300 group font-medium px-1 py-2 rounded-lg hover:bg-gray-700/50 text-sm"
            >
              <Home className="w-3 h-3 group-hover:animate-wiggle" />
              <span>Accueil</span>
            </Link>
            <Link
              to="/catalog"
              className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-all duration-300 group font-medium px-1 py-2 rounded-lg hover:bg-gray-700/50 text-sm"
            >
              <Grid3X3 className="w-3 h-3 group-hover:animate-wiggle" />
              <span>Catalogue</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-all duration-300 group font-medium px-1 py-2 rounded-lg hover:bg-gray-700/50 text-sm"
            >
              <Info className="w-3 h-3 group-hover:animate-wiggle" />
              <span>À propos</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-all duration-300 group font-medium px-1 py-2 rounded-lg hover:bg-gray-700/50 text-sm"
            >
              <Mail className="w-3 h-3 group-hover:animate-wiggle" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Search Bar - Section centrale maximisée */}
          <div className="hidden lg:flex flex-1 max-w-4xl mx-8">
            <SearchBar
              placeholder="Rechercher des créations, templates, illustrations, UI kits, icônes, photos..."
              showFilters={true}
              className="w-full"
            />
          </div>

          {/* Actions - Section droite compacte */}
          <div className="flex items-center space-x-2 ml-1">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-400 hover:text-primary-400 transition-all duration-300 group bg-gray-800 hover:bg-primary-500/10 rounded-xl"
            >
              <ShoppingCart className="w-4 h-4 group-hover:animate-wiggle" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce-in shadow-premium">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="p-2 text-gray-400 hover:text-secondary-400 transition-all duration-300 group bg-gray-800 hover:bg-secondary-500/10 rounded-xl"
            >
              <Heart className="w-4 h-4 group-hover:animate-wiggle" />
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-800 transition-all duration-300 group"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-premium group-hover:shadow-medium">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="hidden sm:block text-gray-100 font-medium text-sm">
                    {user?.firstName || 'Utilisateur'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-primary-400 transition-colors duration-300" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-800 rounded-3xl shadow-large border border-gray-700 py-3 animate-in-down">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-500">Connecté en tant que</p>
                      <p className="font-semibold text-gray-100">{user?.firstName || 'Utilisateur'}</p>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-primary-400 transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="font-medium">Tableau de bord</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-secondary-400 transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-secondary-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="font-medium">Profil</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-accent-400 transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-accent-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="font-medium">Mes commandes</span>
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-secondary-400 transition-all duration-300 group"
                      >
                        <div className="w-2 h-2 bg-secondary-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="font-medium">Favoris</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-700 pt-2">
                      <button className="w-full text-left px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-error-400 transition-all duration-300 group">
                        <div className="w-2 h-2 bg-error-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="font-medium">Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-gray-400 hover:text-primary-400 font-medium transition-all duration-300 hover:bg-gray-800 rounded-xl text-sm"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-3 py-2 shadow-premium hover:shadow-medium text-sm"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-primary-400 transition-all duration-300 bg-gray-800 hover:bg-primary-500/10 rounded-xl"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <SearchBar
            placeholder="Rechercher des créations..."
            showFilters={false}
            className="w-full"
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 py-4 animate-in-down">
            <nav className="space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-primary-400 rounded-2xl transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5 group-hover:animate-wiggle" />
                <span className="font-medium">Accueil</span>
              </Link>
              <Link
                to="/catalog"
                className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-primary-400 rounded-2xl transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Grid3X3 className="w-5 h-5 group-hover:animate-wiggle" />
                <span className="font-medium">Catalogue</span>
              </Link>
              <Link
                to="/about"
                className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-primary-400 rounded-2xl transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="w-5 h-5 group-hover:animate-wiggle" />
                <span className="font-medium">À propos</span>
              </Link>
              <Link
                to="/contact"
                className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-primary-400 rounded-2xl transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Mail className="w-5 h-5 group-hover:animate-wiggle" />
                <span className="font-medium">Contact</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
