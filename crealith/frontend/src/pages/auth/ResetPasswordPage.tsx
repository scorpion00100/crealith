import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { addNotification } from '@/store/slices/uiSlice';
import { apiService } from '@/services/api';
import { useAppDispatch } from '@/store';
import '../../styles/auth/reset-password.css';

export const ResetPasswordPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            dispatch(addNotification({
                type: 'error',
                message: 'Token de réinitialisation manquant',
                duration: 4000,
            }));
            navigate('/forgot-password', { replace: true });
        }
    }, [token, navigate, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !token) {
            return;
        }

        setIsLoading(true);

        try {
            const data = await apiService.post<{ success: boolean; message: string }>(
                '/auth/reset-password',
                { token, newPassword: formData.password },
                false
            );

            if ((data as any).success) {
                dispatch(addNotification({
                    type: 'success',
                    message: 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.',
                    duration: 5000,
                }));

                // Rediriger vers la page de connexion
                navigate('/login', {
                    state: { message: 'Mot de passe réinitialisé avec succès !' },
                    replace: true
                });
            } else {
                throw new Error((data as any).message || 'Erreur lors de la réinitialisation');
            }
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors de la réinitialisation du mot de passe',
                duration: 5000,
            }));
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return null; // Le useEffect va rediriger
    }

    return (
        <div className="reset-password-page">
            <div className="reset-password-container">
                <div className="reset-password-header">
                    <div className="reset-password-logo">
                        <div className="logo-icon">🔒</div>
                        <div className="logo-text">Crealith</div>
                    </div>
                    <h1 className="reset-password-title">Nouveau mot de passe</h1>
                    <p className="reset-password-subtitle">
                        Créez un nouveau mot de passe sécurisé pour votre compte.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="reset-password-form">
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Nouveau mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            placeholder="Votre nouveau mot de passe"
                            className={`form-input ${errors.password ? 'error' : ''}`}
                        />
                        {errors.password && (
                            <span className="field-error">{errors.password}</span>
                        )}
                        <div className="password-requirements">
                            <p>Le mot de passe doit contenir :</p>
                            <ul>
                                <li className={formData.password.length >= 8 ? 'valid' : ''}>
                                    Au moins 8 caractères
                                </li>
                                <li className={/(?=.*[a-z])/.test(formData.password) ? 'valid' : ''}>
                                    Une lettre minuscule
                                </li>
                                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : ''}>
                                    Une lettre majuscule
                                </li>
                                <li className={/(?=.*\d)/.test(formData.password) ? 'valid' : ''}>
                                    Un chiffre
                                </li>
                            </ul>
                        </div>
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
                            placeholder="Confirmez votre nouveau mot de passe"
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                        />
                        {errors.confirmPassword && (
                            <span className="field-error">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="submit-button"
                    >
                        {isLoading ? (
                            <>
                                <div className="loading-spinner"></div>
                                Réinitialisation en cours...
                            </>
                        ) : (
                            'Réinitialiser le mot de passe'
                        )}
                    </button>
                </form>

                <div className="reset-password-footer">
                    <p className="reset-password-footer-text">
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <a href="/login" className="reset-password-link">
                            Se connecter
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};
