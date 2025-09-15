import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';
import {
  ProtectedRoute,
  PublicRoute,
  AdminRoute,
  SellerRoute,
  BuyerRoute,
  VerifiedEmailRoute
} from '@/components/auth/RouteGuards';
import './index.css';

// Lazy loading des pages principales
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })));
const CatalogPage = lazy(() => import('@/pages/CatalogPage.simple').then(module => ({ default: module.CatalogPage })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import('@/pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then(module => ({ default: module.FavoritesPage })));

// Lazy loading des pages d'authentification
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const EmailConfirmationPage = lazy(() => import('@/pages/auth/EmailConfirmationPage').then(module => ({ default: module.EmailConfirmationPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));

// Lazy loading des pages de dashboard
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const SellerDashboardPage = lazy(() => import('@/pages/seller/SellerDashboardPage').then(module => ({ default: module.SellerDashboardPage })));
const BuyerDashboardPage = lazy(() => import('@/pages/buyer/BuyerDashboardPage').then(module => ({ default: module.BuyerDashboardPage })));

// Lazy loading des pages statiques
const AboutPage = lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(module => ({ default: module.ContactPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));

const App: React.FC = () => {
  return (
    <PageErrorBoundary>
      <Provider store={store}>
        <Router>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner fullScreen text="Chargement de la page..." />}>
              <Routes>
                {/* Pages avec Layout général (Header + Footer) */}
                <Route path="/" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement de l'accueil..." />}>
                      <ComponentErrorBoundary>
                        <HomePage />
                      </ComponentErrorBoundary>
                    </Suspense>
                  </Layout>
                } />
                <Route path="/catalog" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement du catalogue..." />}>
                      <ComponentErrorBoundary>
                        <CatalogPage />
                      </ComponentErrorBoundary>
                    </Suspense>
                  </Layout>
                } />
                <Route path="/product/:id" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement du produit..." />}>
                      <ComponentErrorBoundary>
                        <ProductDetailPage />
                      </ComponentErrorBoundary>
                    </Suspense>
                  </Layout>
                } />
                <Route path="/cart" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement du panier..." />}>
                      <CartPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/checkout" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement du paiement..." />}>
                      <CheckoutPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/favorites" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement des favoris..." />}>
                      <FavoritesPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/login" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement de la connexion..." />}>
                      <LoginPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/register" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement de l'inscription..." />}>
                      <RegisterPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/forgot-password" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement de la réinitialisation..." />}>
                      <ForgotPasswordPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/about" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement de la page À propos..." />}>
                      <AboutPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/contact" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement de la page Contact..." />}>
                      <ContactPage />
                    </Suspense>
                  </Layout>
                } />
                <Route path="/profile" element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner text="Chargement du profil..." />}>
                      <ProfilePage />
                    </Suspense>
                  </Layout>
                } />

                {/* Pages de dashboard avec DashboardLayout */}
                <Route path="/dashboard" element={
                  <Suspense fallback={<LoadingSpinner fullScreen text="Chargement du dashboard..." />}>
                    <DashboardPage />
                  </Suspense>
                } />
                <Route path="/seller-dashboard" element={
                  <Suspense fallback={<LoadingSpinner fullScreen text="Chargement du dashboard vendeur..." />}>
                    <SellerDashboardPage />
                  </Suspense>
                } />
                <Route path="/buyer-dashboard" element={
                  <Suspense fallback={<LoadingSpinner fullScreen text="Chargement du dashboard acheteur..." />}>
                    <BuyerDashboardPage />
                  </Suspense>
                } />

                {/* Routes d'authentification avec protection */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement de la connexion..." />}>
                      <LoginPage />
                    </Suspense>
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement de l'inscription..." />}>
                      <RegisterPage />
                    </Suspense>
                  </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement..." />}>
                      <ForgotPasswordPage />
                    </Suspense>
                  </PublicRoute>
                } />
                <Route path="/reset-password" element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement..." />}>
                      <ResetPasswordPage />
                    </Suspense>
                  </PublicRoute>
                } />
                <Route path="/email-confirmation" element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement..." />}>
                      <EmailConfirmationPage />
                    </Suspense>
                  </PublicRoute>
                } />
                <Route path="/verify-email" element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement..." />}>
                      <VerifyEmailPage />
                    </Suspense>
                  </PublicRoute>
                } />

                {/* Routes protégées */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement du dashboard..." />}>
                      <DashboardPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/seller-dashboard" element={
                  <SellerRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement du dashboard vendeur..." />}>
                      <SellerDashboardPage />
                    </Suspense>
                  </SellerRoute>
                } />
                <Route path="/buyer-dashboard" element={
                  <BuyerRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Chargement du dashboard acheteur..." />}>
                      <BuyerDashboardPage />
                    </Suspense>
                  </BuyerRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner text="Chargement du profil..." />}>
                        <ProfilePage />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Routes nécessitant une vérification d'email */}
                <Route path="/cart" element={
                  <VerifiedEmailRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner text="Chargement du panier..." />}>
                        <CartPage />
                      </Suspense>
                    </Layout>
                  </VerifiedEmailRoute>
                } />
                <Route path="/checkout" element={
                  <VerifiedEmailRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner text="Chargement de la commande..." />}>
                        <CheckoutPage />
                      </Suspense>
                    </Layout>
                  </VerifiedEmailRoute>
                } />
                <Route path="/favorites" element={
                  <VerifiedEmailRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner text="Chargement des favoris..." />}>
                        <FavoritesPage />
                      </Suspense>
                    </Layout>
                  </VerifiedEmailRoute>
                } />

                {/* Page d'erreur */}
                <Route path="/unauthorized" element={
                  <Suspense fallback={<LoadingSpinner fullScreen text="Chargement..." />}>
                    <UnauthorizedPage />
                  </Suspense>
                } />
              </Routes>
            </Suspense>
          </AuthProvider>
        </Router>
      </Provider>
    </PageErrorBoundary>
  );
};

export default App;
