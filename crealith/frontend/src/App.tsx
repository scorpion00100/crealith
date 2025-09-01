import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SellerDashboardPage } from '@/pages/SellerDashboardPage';
import { BuyerDashboardPage } from '@/pages/BuyerDashboardPage';
import './index.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Pages avec Layout général (Header + Footer) */}
          <Route path="/" element={
            <Layout>
              <HomePage />
            </Layout>
          } />
          <Route path="/catalog" element={
            <Layout>
              <CatalogPage />
            </Layout>
          } />
          <Route path="/product/:id" element={
            <Layout>
              <ProductDetailPage />
            </Layout>
          } />
          <Route path="/cart" element={
            <Layout>
              <CartPage />
            </Layout>
          } />
          <Route path="/checkout" element={
            <Layout>
              <CheckoutPage />
            </Layout>
          } />
          <Route path="/favorites" element={
            <Layout>
              <FavoritesPage />
            </Layout>
          } />
          <Route path="/login" element={
            <Layout>
              <LoginPage />
            </Layout>
          } />
          <Route path="/register" element={
            <Layout>
              <RegisterPage />
            </Layout>
          } />

          {/* Pages de dashboard avec DashboardLayout */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/seller-dashboard" element={<SellerDashboardPage />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboardPage />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
