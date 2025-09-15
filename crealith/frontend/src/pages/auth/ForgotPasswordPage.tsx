import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addNotification } from '@/store/slices/uiSlice';
import { apiService } from '@/services/api';
import { useAppDispatch } from '@/store';
import '../../styles/auth/forgot-password.css';

export const ForgotPasswordPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            dispatch(addNotification({
                type: 'error',
                message: 'Veuillez saisir votre adresse email',
                duration: 3000,
            }));
            return;
        }

        setIsLoading(true);

        try {
            // Utiliser la configuration API (VITE_API_URL) et les interceptors
            await apiService.post('/auth/forgot-password', { email }, false);

            // Toujours répondre de façon générique pour éviter l'énumération d'emails
            setIsEmailSent(true);
            dispatch(addNotification({
                type: 'success',
                message: 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.',
                duration: 5000,
            }));
        } catch (error: any) {
            // Pour des statuts comme 404/400, rester générique
            const status = error?.response?.status;
            if (status === 400 || status === 404) {
                setIsEmailSent(true);
                dispatch(addNotification({
                    type: 'success',
                    message: 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.',
                    duration: 5000,
                }));
            } else {
                dispatch(addNotification({
                    type: 'error',
                    message: error?.message || 'Erreur lors de l\'envoi de l\'email',
                    duration: 4000,
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <div className="forgot-password-page">
                <div className="forgot-password-container">
                    <div className="forgot-password-header">
                        <div className="forgot-password-logo">
                            <div className="logo-icon">🔒</div>
                            <div className="logo-text">Crealith</div>
                        </div>
                        <h1 className="forgot-password-title">Email envoyé</h1>
                    </div>

                    <div className="forgot-password-content">
                        <div className="email-sent-success">
                            <div className="success-icon">📧</div>
                            <h2>Vérifiez votre boîte de réception</h2>
                            <p>
                                Si l'adresse email <strong>{email}</strong> existe dans notre système,
                                vous recevrez un lien de réinitialisation de mot de passe.
                            </p>

                            <div className="instructions">
                                <h3>Prochaines étapes :</h3>
                                <ol>
                                    <li>Vérifiez votre boîte de réception</li>
                                    <li>Cliquez sur le lien de réinitialisation</li>
                                    <li>Créez un nouveau mot de passe</li>
                                </ol>
                            </div>

                            <div className="help-section">
                                <h4>Vous n'avez pas reçu l'email ?</h4>
                                <ul>
                                    <li>Vérifiez votre dossier spam/courrier indésirable</li>
                                    <li>Assurez-vous que l'adresse email est correcte</li>
                                    <li>Le lien expire dans 30 minutes</li>
                                </ul>
                            </div>
                        </div>

                        <div className="forgot-password-actions">
                            <button
                                onClick={() => {
                                    setIsEmailSent(false);
                                    setEmail('');
                                }}
                                className="try-again-button"
                            >
                                Essayer avec une autre adresse
                            </button>

                            <Link to="/login" className="back-to-login">
                                Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                <div className="forgot-password-header">
                    <div className="forgot-password-logo">
                        <div className="logo-icon">🔒</div>
                        <div className="logo-text">Crealith</div>
                    </div>
                    <h1 className="forgot-password-title">Mot de passe oublié</h1>
                    <p className="forgot-password-subtitle">
                        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Adresse email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="votre@email.com"
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="submit-button"
                    >
                        {isLoading ? (
                            <>
                                <div className="loading-spinner"></div>
                                Envoi en cours...
                            </>
                        ) : (
                            'Envoyer le lien de réinitialisation'
                        )}
                    </button>
                </form>

                <div className="forgot-password-footer">
                    <p className="forgot-password-footer-text">
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link to="/login" className="forgot-password-link">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};