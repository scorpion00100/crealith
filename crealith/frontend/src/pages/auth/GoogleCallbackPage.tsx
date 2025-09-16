import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';

const GoogleCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        try {
            // Lire le fragment d'URL (#accessToken=...&refreshToken=...)
            const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : '';
            const params = new URLSearchParams(hash);
            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');

            if (!accessToken || !refreshToken) {
                // Fallback: rediriger vers login si tokens absents
                return navigate('/login?error=google_oauth_failed');
            }

            // Stocker les tokens pour les appels API
            localStorage.setItem('crealith_token', accessToken);
            localStorage.setItem('crealith_refresh', refreshToken);

            // Récupérer le profil pour décider de la redirection
            authService.getProfile()
                .then(profile => {
                    const requested = searchParams.get('redirect');
                    if (requested) {
                        return navigate(requested);
                    }
                    const roleRoute = profile?.role === 'SELLER' ? '/seller-dashboard' : '/buyer-dashboard';
                    navigate(roleRoute);
                })
                .catch(() => navigate('/login?error=profile_fetch_failed'));
        } catch {
            navigate('/login?error=google_oauth_failed');
        }
    }, [navigate, searchParams]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <p>Connexion Google en cours...</p>
        </div>
    );
};

export default GoogleCallbackPage;
