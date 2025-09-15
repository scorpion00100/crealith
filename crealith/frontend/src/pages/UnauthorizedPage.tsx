import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import '../../styles/pages/unauthorized.css';

export const UnauthorizedPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="unauthorized-page">
            <div className="unauthorized-container">
                <div className="unauthorized-content">
                    <div className="error-icon">🚫</div>
                    <h1 className="error-title">Accès non autorisé</h1>
                    <p className="error-message">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>

                    {user && (
                        <div className="user-info">
                            <p>Connecté en tant que : <strong>{user.firstName} {user.lastName}</strong></p>
                            <p>Rôle : <span className="user-role">{user.role}</span></p>
                        </div>
                    )}

                    <div className="error-actions">
                        <button onClick={handleGoBack} className="go-back-button">
                            ← Retour
                        </button>

                        <Link to="/dashboard" className="dashboard-button">
                            Tableau de bord
                        </Link>

                        <button onClick={handleLogout} className="logout-button">
                            Se déconnecter
                        </button>
                    </div>

                    <div className="help-section">
                        <h3>Besoin d'aide ?</h3>
                        <p>
                            Si vous pensez que c'est une erreur, contactez l'administrateur ou
                            essayez de vous reconnecter avec un compte ayant les bonnes permissions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
