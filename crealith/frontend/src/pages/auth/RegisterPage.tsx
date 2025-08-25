import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: 'buyer' | 'seller';
  agreeToTerms: boolean;
  newsletterOptIn: boolean;
}

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Sélecteurs Redux
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);

  const accountType = searchParams.get('type') as 'buyer' | 'seller' || 'buyer';

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: accountType,
    agreeToTerms: false,
    newsletterOptIn: false
  });

  const [validationErrors, setValidationErrors] = useState<Partial<RegisterFormData>>({});

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
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name as keyof RegisterFormData]) {
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
      const resultAction = await dispatch(registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType,
        agreeToTerms: formData.agreeToTerms,
        newsletterOptIn: formData.newsletterOptIn
      }));

      // Vérifier si l'inscription a réussi
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success(
          formData.accountType === 'seller'
            ? 'Compte vendeur créé avec succès ! Bienvenue chez Crealith.'
            : 'Compte créé avec succès ! Bienvenue chez Crealith.'
        );
        navigate('/dashboard');
      }
    } catch (error) {
      // L'erreur est gérée par le slice et l'effet useEffect
      console.error('Erreur d\'inscription:', error);
    }
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
            <h1>
              {formData.accountType === 'seller'
                ? 'Devenir vendeur'
                : 'Créer un compte'
              }
            </h1>
            <p>
              {formData.accountType === 'seller'
                ? 'Rejoignez notre communauté de créateurs'
                : 'Découvrez des milliers de créations uniques'
              }
            </p>
          </div>

          {/* Account Type Selector */}
          <div className="account-type-selector">
            <label className={`type-option ${formData.accountType === 'buyer' ? 'active' : ''}`}>
              <input
                type="radio"
                name="accountType"
                value="buyer"
                checked={formData.accountType === 'buyer'}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <div className="type-content">
                <div className="type-icon">🛒</div>
                <div className="type-text">
                  <strong>Acheteur</strong>
                  <span>Acheter des créations</span>
                </div>
              </div>
            </label>

            <label className={`type-option ${formData.accountType === 'seller' ? 'active' : ''}`}>
              <input
                type="radio"
                name="accountType"
                value="seller"
                checked={formData.accountType === 'seller'}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <div className="type-content">
                <div className="type-icon">🎨</div>
                <div className="type-text">
                  <strong>Vendeur</strong>
                  <span>Vendre mes créations</span>
                </div>
              </div>
            </label>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={`form-input ${validationErrors.firstName ? 'error' : ''}`}
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                {validationErrors.firstName && (
                  <span className="error-message">{validationErrors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={`form-input ${validationErrors.lastName ? 'error' : ''}`}
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                {validationErrors.lastName && (
                  <span className="error-message">{validationErrors.lastName}</span>
                )}
              </div>
            </div>

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
                placeholder="Mot de passe sécurisé"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {validationErrors.confirmPassword && (
                <span className="error-message">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <span>
                  J'accepte les{' '}
                  <Link to="/terms" className="link">
                    conditions d'utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link to="/privacy" className="link">
                    politique de confidentialité
                  </Link>
                </span>
              </label>
              {validationErrors.agreeToTerms && (
                <span className="error-message">{validationErrors.agreeToTerms}</span>
              )}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="newsletterOptIn"
                  checked={formData.newsletterOptIn}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>
                  Recevoir les actualités et offres spéciales par email
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="auth-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Side Image */}
        <div className="auth-image">
          <div className="auth-image-content">
            <h2>
              {formData.accountType === 'seller'
                ? 'Partagez vos créations avec le monde'
                : 'Explorez un univers créatif'
              }
            </h2>
            <p>
              {formData.accountType === 'seller'
                ? 'Monétisez votre talent et atteignez des milliers d\'acheteurs'
                : 'Trouvez l\'inspiration parmi des milliers de designs professionnels'
              }
            </p>
            <div className="auth-features">
              {formData.accountType === 'seller' ? (
                <>
                  <div className="feature-item">
                    <span className="feature-icon">💰</span>
                    <span>Commissions avantageuses</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📈</span>
                    <span>Outils de promotion</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <span>Communauté active</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="feature-item">
                    <span className="feature-icon">⭐</span>
                    <span>Designs de qualité</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔄</span>
                    <span>Téléchargements illimités</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🛡️</span>
                    <span>Garantie satisfaction</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
