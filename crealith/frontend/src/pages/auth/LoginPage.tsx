import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import '../../styles/auth/login.css';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);

      dispatch(addNotification({
        type: 'success',
        message: 'Connexion réussie !',
        duration: 3000,
      }));

      // Rediriger vers la page demandée ou le dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de la connexion',
        duration: 4000,
      }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">🎨</div>
            <div className="auth-logo-text">Crealith</div>
          </div>
          <h1 className="auth-title">Connexion</h1>
          <p className="auth-subtitle">Connectez-vous à votre compte Crealith</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="votre@email.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Votre mot de passe"
              className="form-input"
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <label htmlFor="rememberMe" className="checkbox-custom"></label>
              </div>
              <label htmlFor="rememberMe" className="checkbox-label">Se souvenir de moi</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
