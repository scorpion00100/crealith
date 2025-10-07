import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from '@/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';
import {
  ProtectedRoute,
  PublicRoute,
  SellerRoute,
  BuyerRoute,
  VerifiedEmailRoute
} from '@/components/auth/RouteGuards';
import './index.css';

// Lazy loading des pages principales
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })));
const CatalogPage = lazy(() => import('@/pages/CatalogPage').then(module => ({ default: module.CatalogPage })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import('@/pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then(module => ({ default: module.FavoritesPage })));
const DownloadsPage = lazy(() => import('@/pages/DownloadsPage').then(module => ({ default: module.DownloadsPage })));

// Lazy loading des pages d'authentification
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const EmailConfirmationPage = lazy(() => import('@/pages/auth/EmailConfirmationPage').then(module => ({ default: module.EmailConfirmationPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const ResetSuccessPage = lazy(() => import('@/pages/auth/ResetSuccessPage').then(module => ({ default: module.ResetSuccessPage })));
const GoogleCallbackPage = lazy(() => import('@/pages/auth/GoogleCallbackPage').then(module => ({ default: module.default })));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));

// Lazy loading des pages de dashboard
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const SellerDashboardPage = lazy(() => import('@/pages/seller/SellerDashboardPage').then(module => ({ default: module.SellerDashboardPage })));
const SellerProductDetailPage = lazy(() => import('@/pages/seller/SellerProductDetailPage').then(module => ({ default: module.default })));
const BuyerDashboardPage = lazy(() => import('@/pages/buyer/BuyerDashboardPage').then(module => ({ default: module.default })));
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then(module => ({ default: module.OrdersPage })));
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage').then(module => ({ default: module.default })));
const MyReviewsPage = lazy(() => import('@/pages/MyReviewsPage').then(module => ({ default: module.default })));

// Lazy loading des pages statiques
const AboutPage = lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(module => ({ default: module.ContactPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const SellerProfilePage = lazy(() => import('@/pages/seller/SellerProfilePage').then(module => ({ default: module.SellerProfilePage })));
const SellerSettingsPage = lazy(() => import('@/pages/seller/SellerSettingsPage').then(module => ({ default: module.SellerSettingsPage })));

const App: React.FC = () => {
  return (
    <PageErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <Router>
            <AuthProvider>
              <Suspense fallback={<LoadingSpinner fullScreen text="Chargement de la page..." />}>
                <GlobalLoadingOverlay />
                <NotificationCenter />
                <Routes>
                  {/* Pages avec Layout général (Header + Footer) */}
                  <Route path="/" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement de l'accueil..." />}>
                          <ComponentErrorBoundary>
                            <HomePage />
                          </ComponentErrorBoundary>
                        </Suspense>
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/catalog" element={
                    <PublicRoute allowAuthenticated={true}>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement du catalogue..." />}>
                          <ComponentErrorBoundary>
                            <CatalogPage />
                          </ComponentErrorBoundary>
                        </Suspense>
                      </Layout>
                    </PublicRoute>
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

                  <Route path="/auth/google/callback" element={
                    <Layout>
                      <Suspense fallback={<LoadingSpinner text="Finalisation de la connexion Google..." />}>
                        <GoogleCallbackPage />
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


                  {/* Pages de dashboard (versions non protégées retirées) */}

                  {/* Routes d'authentification avec protection */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement de la connexion..." />}>
                          <LoginPage />
                        </Suspense>
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement de l'inscription..." />}>
                          <RegisterPage />
                        </Suspense>
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/forgot-password" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement..." />}>
                          <ForgotPasswordPage />
                        </Suspense>
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/reset-password" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement..." />}>
                          <ResetPasswordPage />
                        </Suspense>
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/reset-success" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement..." />}>
                          <ResetSuccessPage />
                        </Suspense>
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/email-confirmation" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement..." />}>
                          <EmailConfirmationPage />
                        </Suspense>
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/verify-email" element={
                    <PublicRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement..." />}>
                          <VerifyEmailPage />
                        </Suspense>
                      </Layout>
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
                  <Route path="/seller/product/:id" element={
                    <SellerRoute>
                      <Suspense fallback={<LoadingSpinner fullScreen text="Chargement du produit..." />}>
                        <SellerProductDetailPage />
                      </Suspense>
                    </SellerRoute>
                  } />
                  <Route path="/seller/profile" element={
                    <SellerRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement du profil vendeur..." />}>
                          <SellerProfilePage />
                        </Suspense>
                      </Layout>
                    </SellerRoute>
                  } />
                  <Route path="/seller/settings" element={
                    <SellerRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement des paramètres vendeur..." />}>
                          <SellerSettingsPage />
                        </Suspense>
                      </Layout>
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
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement des paramètres..." />}>
                          <SettingsPage />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } />

                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement des commandes..." />}>
                          <OrdersPage />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/invoices" element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement des factures..." />}>
                          <InvoicesPage />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/my-reviews" element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement de vos avis..." />}>
                          <MyReviewsPage />
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
                  <Route path="/downloads" element={
                    <VerifiedEmailRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Chargement des téléchargements..." />}>
                          <DownloadsPage />
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
      </HelmetProvider>
    </PageErrorBoundary>
  );
};

export default App;
