import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import '../../styles/auth/register.css';
import '../../styles/auth/form-validation.css';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'buyer' as 'buyer' | 'seller',
    agreeToTerms: false,
    newsletterOptIn: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Validation en temps réel
    validateField(name, type === 'checkbox' ? checked : value);
  };

  const validateField = (fieldName: string, value: any) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'Le prénom est requis';
        } else if (value.trim().length < 2) {
          newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Le nom est requis';
        } else if (value.trim().length < 2) {
          newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'L\'email est requis';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Format d\'email invalide';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Le mot de passe est requis';
        } else if (value.length < 8) {
          newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'agreeToTerms':
        if (!value) {
          newErrors.agreeToTerms = 'Vous devez accepter les conditions d\'utilisation';
        } else {
          delete newErrors.agreeToTerms;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    // Valider tous les champs
    validateField('firstName', formData.firstName);
    validateField('lastName', formData.lastName);
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
    validateField('agreeToTerms', formData.agreeToTerms);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.keys(errors).length > 0;
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);

      dispatch(addNotification({
        type: 'success',
        message: 'Compte créé avec succès !',
        duration: 3000,
      }));

      // Rediriger vers la page demandée ou le dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de la création du compte',
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
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-subtitle">Rejoignez la communauté Crealith</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Votre prénom"
                className={`form-input ${errors.firstName ? 'error' : ''}`}
              />
              {errors.firstName && (
                <span className="field-error">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Votre nom"
                className={`form-input ${errors.lastName ? 'error' : ''}`}
              />
              {errors.lastName && (
                <span className="field-error">{errors.lastName}</span>
              )}
            </div>
          </div>

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
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-row">
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
                className={`form-input ${errors.password ? 'error' : ''}`}
              />
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirmez votre mot de passe"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Type de compte</label>
            <div className="account-type-selector">
              <label className="account-type-option">
                <input
                  type="radio"
                  name="accountType"
                  value="buyer"
                  checked={formData.accountType === 'buyer'}
                  onChange={handleInputChange}
                />
                <div className="account-type-content">
                  <div className="account-type-info">
                    <h4>Acheteur</h4>
                    <p>Achetez des produits numériques</p>
                  </div>
                </div>
              </label>

              <label className="account-type-option">
                <input
                  type="radio"
                  name="accountType"
                  value="seller"
                  checked={formData.accountType === 'seller'}
                  onChange={handleInputChange}
                />
                <div className="account-type-content">
                  <div className="account-type-info">
                    <h4>Vendeur</h4>
                    <p>Vendez vos créations</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                J'accepte les{' '}
                <Link to="/terms" className="link">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="link">
                  politique de confidentialité
                </Link>
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className="field-error">{errors.agreeToTerms}</span>
            )}
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="newsletterOptIn"
                checked={formData.newsletterOptIn}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                Je souhaite recevoir la newsletter avec les nouveautés
              </span>
            </label>
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
                Création du compte...
              </>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

