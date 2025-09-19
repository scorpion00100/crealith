import React from 'react';
import { Link } from 'react-router-dom';

export const ResetSuccessPage: React.FC = () => {
    return (
        <div className="auth-page">
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <h1 className="auth-title">Mot de passe réinitialisé</h1>
                <p className="auth-subtitle">Votre mot de passe a été mis à jour avec succès.</p>
                <div style={{ marginTop: 20 }}>
                    <Link to="/login" className="submit-button">Aller à la connexion</Link>
                </div>
            </div>
        </div>
    );
};
