import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Sélecteurs Redux
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [validationErrors, setValidationErrors] = useState<Partial<LoginFormData>>({});

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Nettoyer les erreurs au montage
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Afficher les erreurs via toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name as keyof LoginFormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear Redux error when user modifies form
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Utiliser le thunk Redux
      const resultAction = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      }));

      // Vérifier si la connexion a réussi
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success('Connexion réussie !');
        navigate('/dashboard');
      }
    } catch (error) {
      // L'erreur est gérée par le slice et l'effet useEffect
      console.error('Erreur de connexion:', error);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    toast.info(`Connexion ${provider} bientôt disponible`);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="logo">
              <div className="logo-icon">C</div>
              <div className="logo-text">Crealith</div>
            </Link>
            <h1>Se connecter</h1>
            <p>Accédez à votre compte pour continuer</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                placeholder="Votre mot de passe"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>ou</span>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <button
              type="button"
              className="btn btn-outline btn-full social-btn"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <span className="social-icon">🔍</span>
              Continuer avec Google
            </button>
            <button
              type="button"
              className="btn btn-outline btn-full social-btn"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              <span className="social-icon">👥</span>
              Continuer avec Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register" className="auth-link">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Side Image */}
        <div className="auth-image">
          <div className="auth-image-content">
            <h2>Rejoignez la communauté créative</h2>
            <p>Accédez à des milliers de designs, templates et assets de qualité professionnelle</p>
            <div className="auth-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Produits</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5K+</div>
                <div className="stat-label">Créateurs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Téléchargements</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
