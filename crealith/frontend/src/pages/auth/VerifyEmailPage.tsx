import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import '../../styles/auth/verify-email.css';

export const VerifyEmailPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, redirectAfterLogin } = useAuth();

    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const token = searchParams.get('token');
        const emailFromState = location.state?.email as string;

        if (token) {
            verifyEmail(token);
        } else if (emailFromState) {
            // Si pas de token mais un email, afficher le formulaire de saisie manuelle
            setVerificationStatus('pending');
        } else {
            // Pas de token ni d'email, rediriger vers la page de confirmation
            navigate('/email-confirmation', { replace: true });
        }

        // Si l'utilisateur est déjà connecté et vérifié, rediriger
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [searchParams, location.state, isAuthenticated, navigate]);

    const verifyEmail = async (token: string) => {
        setIsVerifying(true);
        setVerificationStatus('pending');

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (data.success) {
                setVerificationStatus('success');
                dispatch(addNotification({
                    type: 'success',
                    message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
                    duration: 5000,
                }));

                // Rediriger vers la page de connexion après 3 secondes
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Email vérifié avec succès !' },
                        replace: true
                    });
                }, 3000);
            } else {
                throw new Error(data.message || 'Erreur lors de la vérification');
            }
        } catch (error: any) {
            setVerificationStatus('error');
            setErrorMessage(error.message || 'Erreur lors de la vérification de l\'email');
            dispatch(addNotification({
                type: 'error',
                message: error.message || 'Erreur lors de la vérification de l\'email',
                duration: 5000,
            }));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleManualVerification = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const token = formData.get('token') as string;

        if (token) {
            verifyEmail(token);
        }
    };

    const renderContent = () => {
        switch (verificationStatus) {
            case 'success':
                return (
                    <div className="verification-success">
                        <div className="success-icon">✅</div>
                        <h2>Email vérifié avec succès !</h2>
                        <p>Votre compte est maintenant activé. Vous allez être redirigé vers la page de connexion.</p>
                        <div className="loading-spinner"></div>
                    </div>
                );

            case 'error':
                return (
                    <div className="verification-error">
                        <div className="error-icon">❌</div>
                        <h2>Erreur de vérification</h2>
                        <p>{errorMessage}</p>
                        <div className="error-actions">
                            <button
                                onClick={() => navigate('/email-confirmation')}
                                className="retry-button"
                            >
                                Réessayer
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="login-button"
                            >
                                Aller à la connexion
                            </button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="verification-pending">
                        {isVerifying ? (
                            <>
                                <div className="loading-spinner"></div>
                                <h2>Vérification en cours...</h2>
                                <p>Veuillez patienter pendant que nous vérifions votre email.</p>
                            </>
                        ) : (
                            <>
                                <div className="pending-icon">⏳</div>
                                <h2>Vérification manuelle</h2>
                                <p>Entrez le code de vérification reçu par email :</p>
                                <form onSubmit={handleManualVerification} className="verification-form">
                                    <input
                                        type="text"
                                        name="token"
                                        placeholder="Code de vérification"
                                        required
                                        className="verification-input"
                                    />
                                    <button type="submit" className="verify-button">
                                        Vérifier
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="verify-email-page">
            <div className="verify-email-container">
                <div className="verify-email-header">
                    <div className="verify-email-logo">
                        <div className="logo-icon">🎨</div>
                        <div className="logo-text">Crealith</div>
                    </div>
                </div>

                <div className="verify-email-content">
                    {renderContent()}
                </div>

                <div className="verify-email-footer">
                    <p>Besoin d'aide ? <a href="/support">Contactez le support</a></p>
                </div>
            </div>
        </div>
    );
};
