## Configuration Google OAuth2 (Google Cloud Console)

1. Créez un projet sur Google Cloud Console
   - `https://console.cloud.google.com/`
   - Activez l'API "Google Identity Services" (OAuth2) si nécessaire

2. Créez des identifiants OAuth 2.0
   - Type: "ID client OAuth"
   - Application: "Application Web"
   - Origines JavaScript autorisées:
     - `http://localhost:3000`
   - URI de redirection autorisés:
     - `http://localhost:5000/api/auth/google/callback`

3. Récupérez le `Client ID` et le `Client Secret`
   - Ajoutez-les dans `crealith/backend/.env.local` ou `.env`:
     - `GOOGLE_CLIENT_ID=`
     - `GOOGLE_CLIENT_SECRET=`
     - `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`

4. Variables d'environnement nécessaires
```
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
FRONTEND_URL="http://localhost:3000"
JWT_ACCESS_SECRET="<64+ chars strong secret>"
JWT_REFRESH_SECRET="<64+ chars strong secret>"
```

5. Démarrer le flow depuis le frontend
   - Ouvrir `GET /api/auth/google?redirect=http://localhost:3000` dans le navigateur
   - Après consentement Google, l’API redirige vers `redirect` avec `#accessToken` et `#refreshToken` en fragment d’URL

6. Conseils de sécurité
   - Toujours utiliser HTTPS en production
   - Restreindre les domaines autorisés dans Google Cloud (origines/redirects)
   - Utiliser des secrets longs (>= 64 chars) pour JWT
   - Mettre en place des clés séparées par environnement (dev/staging/prod)

7. Production
   - Mettre à jour `GOOGLE_CALLBACK_URL` (ex: `https://api.crealith.com/api/auth/google/callback`)
   - Ajouter les domaines frontend de prod dans les origines autorisées


