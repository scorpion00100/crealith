import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/ui/ProductCard';
import { addToCart } from '@/store/slices/cartSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { Product } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Sélecteurs Redux
  const { products, isLoading } = useAppSelector(state => state.products);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Produits en vedette (featured)
  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 3);

  // Charger les produits au montage
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const handleAddToCart = async (product: Product) => {
    try {
      dispatch(addToCart(product));
      dispatch(addNotification({
        type: 'success',
        message: `${product.title} ajouté au panier`,
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

  const handleToggleFavorite = (productId: string) => { // Changé de number | string à string
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Connectez-vous pour ajouter aux favoris',
        duration: 4000
      }));
      return;
    }

    // TODO: Implémenter la logique des favoris
    dispatch(addNotification({
      type: 'info',
      message: 'Fonctionnalité favoris bientôt disponible',
      duration: 3000
    }));
  };

  const handlePreview = (product: Product) => {
    // Navigation vers la page de détail du produit
    // navigate(`/product/${product.id}`);
    console.log('Aperçu:', product.title);
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="homepage">
        <div className="container">
          <div className="loading-container" style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner">Chargement...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Créez, Vendez, Inspirez</h1>
              <p className="hero-description">
                La marketplace créative pour vendre vos designs, templates et assets numériques de qualité.
                Rejoignez une communauté de plus de 5,000 créateurs passionnés.
              </p>
              <div className="hero-actions">
                <Link to="/catalog" className="btn btn-primary btn-large">
                  Explorer le catalogue
                </Link>
                {!isAuthenticated && (
                  <Link to="/register?type=seller" className="btn btn-outline btn-large">
                    Devenir vendeur
                  </Link>
                )}
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number purple">10,000+</div>
                <div className="stat-label">Produits disponibles</div>
              </div>
              <div className="stat-item">
                <div className="stat-number blue">5,000+</div>
                <div className="stat-label">Créateurs actifs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number green">50,000+</div>
                <div className="stat-label">Téléchargements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories populaires */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Catégories populaires</h2>
          <div className="categories-grid">
            <Link to="/catalog?category=templates-web" className="category-card">
              <div className="category-icon">🌐</div>
              <h3>Templates Web</h3>
              <p>1,250 produits</p>
            </Link>
            <Link to="/catalog?category=ui-kits" className="category-card">
              <div className="category-icon">🎨</div>
              <h3>UI Kits</h3>
              <p>890 produits</p>
            </Link>
            <Link to="/catalog?category=dashboards" className="category-card">
              <div className="category-icon">📊</div>
              <h3>Dashboards</h3>
              <p>640 produits</p>
            </Link>
            <Link to="/catalog?category=mobile-apps" className="category-card">
              <div className="category-icon">📱</div>
              <h3>Mobile Apps</h3>
              <p>520 produits</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Produits en vedette */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Produits populaires</h2>
            <Link to="/catalog" className="section-link">
              Voir tout →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite} // Plus besoin de wrapper
                  onPreview={handlePreview}
                  isFavorite={false} // TODO: Récupérer depuis un slice favoris
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>Aucun produit en vedette pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à rejoindre notre communauté créative ?</h2>
            <p>Vendez vos créations et connectez-vous avec des milliers d'acheteurs passionnés</p>
            <div className="cta-actions">
              <Link to="/register?type=seller" className="btn btn-primary btn-large">
                Créer un compte vendeur
              </Link>
              <Link to="/catalog" className="btn btn-outline btn-large">
                Commencer à acheter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
