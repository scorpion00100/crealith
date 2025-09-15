import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/ui/ProductCard';
import { Product } from '@/types';
import { useAppSelector, useAppDispatch } from '@/store';
import { addToCartAsync } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import { useAuth } from '@/hooks/useAuth';
import '../styles/pages/home.css';
import {
  ArrowRight,
  Star,
  Users,
  Download,
  TrendingUp,
  Palette,
  Award,
  Play,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Heart,
  Sparkles,
  ShoppingBag,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { items: products } = useAppSelector(state => state.products);

  // Mock data pour les produits populaires
  const featuredProducts: Product[] = [
    {
      id: '1',
      title: 'Template Dashboard Admin Premium',
      description: 'Dashboard moderne avec plus de 50 composants réutilisables',
      price: '49.99',
      originalPrice: '79.99',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      category: { id: '1', name: 'Templates Web', slug: 'templates-web' },
      rating: 4.8,
      reviews: 127,
      downloadsCount: 2341,
      isFeatured: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      author: 'AdminDesign'
    },
    {
      id: '2',
      title: 'Kit UI Mobile App Complete',
      description: 'Kit complet pour applications mobiles iOS et Android',
      price: '29.99',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      category: { id: '2', name: 'UI Kits', slug: 'ui-kits' },
      rating: 4.9,
      reviews: 89,
      downloadsCount: 1567,
      isFeatured: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      author: 'MobileDesign'
    },
    {
      id: '3',
      title: 'Illustrations Pack Business',
      description: '100 illustrations vectorielles pour projets business',
      price: '19.99',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
      category: { id: '3', name: 'Illustrations', slug: 'illustrations' },
      rating: 4.7,
      reviews: 203,
      downloadsCount: 3421,
      isFeatured: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      author: 'IllustratorPro'
    }
  ];

  // Handlers pour les actions produits
  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Connectez-vous pour ajouter au panier',
        duration: 4000
      }));
      navigate('/login?redirect=/');
      return;
    }

    try {
      await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Produit ajouté au panier !',
        duration: 3000
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Erreur lors de l\'ajout au panier',
        duration: 4000
      }));
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Connectez-vous pour ajouter aux favoris',
        duration: 4000
      }));
      navigate('/login?redirect=/');
      return;
    }

    try {
      await dispatch(toggleFavorite(productId)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Favoris mis à jour !',
        duration: 3000
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Erreur lors de la gestion des favoris',
        duration: 4000
      }));
    }
  };

  return (
    <div className="min-h-screen text-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10"></div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-full blur-3xl animate-float delay-500"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-primary-400/20 to-primary-500/20 rounded-full blur-2xl animate-float delay-1500"></div>

        <div className="relative container-custom section-padding">
          <div className="text-center">
            {/* Logo et titre */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-premium animate-float">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full animate-pulse-soft"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-full animate-pulse-soft delay-500"></div>
              </div>
            </div>

            <h1 className="responsive-text font-black mb-6 text-gradient-primary leading-tight">
              Marketplace
              <br />
              <span className="text-gradient-secondary">Créative</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Découvrez, achetez et vendez des produits digitaux créatifs de qualité.
              Rejoignez une communauté de plus de <span className="font-bold text-secondary-400">5,000 créateurs passionnés</span>.
            </p>

            {/* Video Preview */}
            <div className="mb-12">
              <div className="relative inline-block group">
                <div className="w-80 h-48 bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl overflow-hidden shadow-large border border-gray-600">
                  <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-premium group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/catalog"
                className="group inline-flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-premium hover:shadow-2xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105"
              >
                <span>Explorer le catalogue</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register?type=seller"
                  className="btn-outline px-8 py-4 text-lg shadow-medium hover:shadow-large"
                >
                  Devenir vendeur
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                  <Download className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-black mb-2 text-gradient-primary">{products.length + 1000}</div>
                <div className="text-gray-300 font-semibold">Produits disponibles</div>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-secondary group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-black mb-2 text-gradient-secondary">5,000+</div>
                <div className="text-gray-300 font-semibold">Créateurs actifs</div>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-medium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-black mb-2 text-gradient-secondary">50,000+</div>
                <div className="text-gray-300 font-semibold">Téléchargements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Award className="h-10 w-10 text-secondary-400 mr-3" />
              <h2 className="responsive-heading font-black text-gradient-secondary">
                Produits Populaires
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Découvrez nos produits les plus appréciés par la communauté
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ProductCard
                  product={product}
                  variant="buyer"
                  onView={handleViewProduct}
                  onAddToCart={handleAddToCart}
                  onAddToFavorites={handleToggleFavorite}
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/catalog"
              className="group inline-flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-premium hover:shadow-2xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105"
            >
              Voir tous les produits
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="responsive-heading font-black text-gradient-primary mb-6">
              Pourquoi choisir Crealith ?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Une plateforme moderne conçue pour les créateurs et les acheteurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group animate-in-up">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Rapide & Simple</h3>
              <p className="text-gray-400 leading-relaxed">
                Téléchargez vos achats instantanément après paiement sécurisé
              </p>
            </div>

            <div className="text-center group animate-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-secondary group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Sécurisé</h3>
              <p className="text-gray-400 leading-relaxed">
                Paiements sécurisés et protection des droits d'auteur
              </p>
            </div>

            <div className="text-center group animate-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Communauté</h3>
              <p className="text-gray-400 leading-relaxed">
                Rejoignez des milliers de créateurs du monde entier
              </p>
            </div>

            <div className="text-center group animate-in-up" style={{ animationDelay: '300ms' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-medium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Qualité</h3>
              <p className="text-gray-400 leading-relaxed">
                Produits vérifiés et évalués par la communauté
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="responsive-heading font-black text-gradient-secondary mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Trois étapes simples pour commencer votre aventure créative
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group animate-in-up">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                  <Eye className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Découvrez</h3>
              <p className="text-gray-400 leading-relaxed">
                Parcourez notre catalogue de produits créatifs de qualité
              </p>
            </div>

            <div className="text-center group animate-in-up" style={{ animationDelay: '100ms' }}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-secondary group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                  <ShoppingBag className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Achetez</h3>
              <p className="text-gray-400 leading-relaxed">
                Effectuez un achat sécurisé et recevez votre produit instantanément
              </p>
            </div>

            <div className="text-center group animate-in-up" style={{ animationDelay: '200ms' }}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Créez</h3>
              <p className="text-gray-400 leading-relaxed">
                Utilisez vos achats pour créer des projets extraordinaires
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="responsive-heading font-black text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez notre communauté et commencez à créer ou acheter dès aujourd'hui
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-3xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Créer un compte
            </Link>
            <Link
              to="/catalog"
              className="border-2 border-white text-white px-8 py-4 rounded-3xl text-lg font-bold hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
