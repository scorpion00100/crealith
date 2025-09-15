import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import '../../styles/auth/email-confirmation.css';

export const EmailConfirmationPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [email, setEmail] = useState<string>('');
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        // Récupérer l'email depuis l'état de navigation
        const emailFromState = location.state?.email as string;
        if (emailFromState) {
            setEmail(emailFromState);
        }

        // Si l'utilisateur est déjà connecté, rediriger
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [location.state, isAuthenticated, navigate]);

    // Gérer le cooldown pour le renvoi d'email
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendEmail = async () => {
        if (!email || isResending || resendCooldown > 0) return;

        setIsResending(true);
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                dispatch(addNotification({
                    type: 'success',
                    message: 'Email de vérification renvoyé avec succès !',
                    duration: 4000,
                }));
                setResendCooldown(60); // 60 secondes de cooldown
            } else {
                throw new Error(data.message || 'Erreur lors du renvoi de l\'email');
            }
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors du renvoi de l\'email',
                duration: 4000,
            }));
        } finally {
            setIsResending(false);
        }
    };

    const handleCheckEmail = () => {
        // Rediriger vers la page de vérification avec l'email
        navigate('/verify-email', {
            state: { email },
            replace: true
        });
    };

    return (
        <div className="email-confirmation-page">
            <div className="email-confirmation-container">
                <div className="email-confirmation-header">
                    <div className="email-confirmation-icon">📧</div>
                    <h1 className="email-confirmation-title">Vérifiez votre email</h1>
                    <p className="email-confirmation-subtitle">
                        Nous avons envoyé un lien de vérification à
                    </p>
                    <div className="email-address">{email}</div>
                </div>

                <div className="email-confirmation-content">
                    <div className="instructions">
                        <h3>Prochaines étapes :</h3>
                        <ol>
                            <li>Vérifiez votre boîte de réception</li>
                            <li>Cliquez sur le lien de vérification dans l'email</li>
                            <li>Retournez sur cette page pour continuer</li>
                        </ol>
                    </div>

                    <div className="actions">
                        <button
                            onClick={handleCheckEmail}
                            className="check-email-button"
                        >
                            J'ai vérifié mon email
                        </button>

                        <div className="resend-section">
                            <p>Vous n'avez pas reçu l'email ?</p>
                            <button
                                onClick={handleResendEmail}
                                disabled={isResending || resendCooldown > 0}
                                className="resend-button"
                            >
                                {isResending ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Envoi en cours...
                                    </>
                                ) : resendCooldown > 0 ? (
                                    `Renvoyer dans ${resendCooldown}s`
                                ) : (
                                    'Renvoyer l\'email'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="help-section">
                        <h4>Besoin d'aide ?</h4>
                        <ul>
                            <li>Vérifiez votre dossier spam/courrier indésirable</li>
                            <li>Assurez-vous que l'adresse email est correcte</li>
                            <li>Contactez le support si le problème persiste</li>
                        </ul>
                    </div>
                </div>

                <div className="email-confirmation-footer">
                    <Link to="/login" className="back-to-login">
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};
