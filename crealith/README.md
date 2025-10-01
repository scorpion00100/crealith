# 🚀 Crealith - Marketplace Digitale

Une marketplace moderne inspirée d'Etsy, dédiée exclusivement aux produits digitaux (ebooks, templates, code, graphismes, etc.).

> **🎉 Version 1.1 - Post Audit Sécurité & Performance**  
> Validation complète des entrées, cache Redis, refactoring composants, et sécurisation des uploads !

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [✨ Nouvelles Améliorations](#-nouvelles-améliorations)
- [Stack Technique](#-stack-technique)
- [Installation Rapide](#-installation-rapide)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [API Documentation](#-api-documentation)
- [Structure du Projet](#-structure-du-projet)
- [Contribuer](#-contribuer)

## ✨ Fonctionnalités

### 👥 Utilisateurs
- **Inscription/Connexion** avec JWT
- **Rôles** : Acheteur, Vendeur, Admin
- **Profils** personnalisables avec avatars
- **Système de notifications** en temps réel

### 🛍️ Acheteurs
- **Catalogue** avec recherche et filtres avancés
- **Panier d'achat** persistant
- **Paiements sécurisés** via Stripe
- **Téléchargements sécurisés** avec URLs signées
- **Système de favoris**
- **Reviews et notations**
- **Historique des commandes**

### 🏪 Vendeurs
- **Upload de produits** avec prévisualisation
- **Gestion des produits** (CRUD)
- **Analytics** détaillées (ventes, revenus, téléchargements)
- **Paiements** via Stripe Connect
- **Tableau de bord** complet

### 🔧 Administration
- **Modération** des produits et utilisateurs
- **Gestion des catégories**
- **Analytics globales**
- **Gestion des litiges**

## ✨ Nouvelles Améliorations

### 🔒 Sécurité Renforcée
- ✅ **Validation Zod** sur toutes les routes API (auth, produits, panier, recherche)
- ✅ **Upload sécurisé** avec validation MIME types (images, PDF, ZIP, vidéos, code)
- ✅ **Rate limiting** sur recherche (30 req/min) pour prévenir les abus
- ✅ Messages d'erreur clairs et explicites (format: `field: error message`)

### ⚡ Performance
- ✅ **Cache Redis** pour produits featured (TTL 5 min, invalidation auto)
- ✅ Temps de réponse page d'accueil : -90% avec cache actif
- ✅ Indexes base de données optimisés

### 🧩 Qualité du Code
- ✅ **Refactoring** composants volumineux (660 → 200 lignes)
- ✅ **Hooks personnalisés** pour logique métier réutilisable
- ✅ **Composants seller** modulaires et testables
- ✅ Repository nettoyé (dist/, logs/ exclus de Git)

### 📚 Documentation
- 📄 [Guide de Démarrage Rapide](../docs/QUICK_START_GUIDE.md)
- 📄 [Résumé des Améliorations](../docs/IMPROVEMENTS_SUMMARY.md)
- 📄 [Améliorations Futures](../docs/FUTURE_IMPROVEMENTS.md)
- 📄 [Guide de Tests de Sécurité](../docs/SECURITY_TESTING_GUIDE.md)
- 📄 [Implémentation Complète](../docs/IMPLEMENTATION_COMPLETE.md)

## 🛠️ Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Redux Toolkit** pour la gestion d'état
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- **Vite** pour le build
- **Socket.io** pour les notifications temps réel

### Backend
- **Node.js** avec TypeScript
- **Express.js** framework web
- **Prisma ORM** avec PostgreSQL
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **Zod** pour la validation des entrées ✨
- **Redis** pour le cache et sessions ✨
- **Stripe** pour les paiements
- **ImageKit** pour le stockage de fichiers
- **Jest** pour les tests

### Base de données & Cache
- **PostgreSQL** avec Prisma
- **Redis** pour cache et rate limiting ✨
- **Indexes optimisés** pour les performances
- **Migrations** automatisées

## 🚀 Installation Rapide

> 📖 **Documentation complète :** Voir [QUICK_START_GUIDE.md](../docs/QUICK_START_GUIDE.md) pour des instructions détaillées.

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Redis 6+ ✨
- npm ou yarn

### 1. Cloner le repository
```bash
git clone https://github.com/votre-username/crealith.git
cd crealith
```

### 2. Installer les dépendances
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Démarrer Redis
```bash
# Option 1: Installation locale
redis-server

# Option 2: Docker
docker run -d -p 6379:6379 --name crealith-redis redis:7-alpine

# Vérifier
redis-cli ping  # Doit répondre: PONG
```

### 4. Configuration de la base de données
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### 5. Variables d'environnement
```bash
# Backend
cp env.example .env
# Éditer .env avec vos clés API

# Frontend
cp .env.example .env
```

## ⚙️ Configuration

### Variables d'environnement Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/crealith_db"

# JWT (minimum 32 caractères) ✨
JWT_ACCESS_SECRET="your-access-secret-min-32-chars-here"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars-here"

# Redis ✨
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optionnel en dev
REDIS_DB=0

# Server
PORT=3001
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# ImageKit
IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
IMAGEKIT_PRIVATE_KEY="your_imagekit_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_endpoint"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Services externes requis

1. **Stripe** : Compte développeur avec clés API
2. **ImageKit** : Compte pour le stockage de fichiers
3. **PostgreSQL** : Base de données (locale ou cloud)
4. **Redis** : Cache et sessions (locale ou Redis Cloud) ✨

## 🏃‍♂️ Utilisation

### Développement
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

## 🧪 Tests

### Tests unitaires
```bash
cd backend
npm test
```

### Tests avec couverture
```bash
npm run test:coverage
```

### Tests E2E
```bash
npm run test:e2e
```

## 📚 API Documentation

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

#### Produits
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `GET /api/products/:id` - Détails d'un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

#### Commandes
- `GET /api/orders` - Historique des commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/:id` - Détails d'une commande

#### Téléchargements
- `GET /api/downloads/generate/:productId` - Générer URL de téléchargement
- `GET /api/downloads/process/:token` - Traiter un téléchargement

#### Analytics
- `GET /api/analytics/seller` - Stats vendeur
- `GET /api/analytics/admin` - Stats admin

## 📁 Structure du Projet

```
crealith/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Contrôleurs API
│   │   ├── services/        # Logique métier
│   │   ├── routes/          # Routes Express
│   │   ├── middleware/      # Middlewares
│   │   ├── utils/           # Utilitaires
│   │   └── types/           # Types TypeScript
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma de base de données
│   │   └── migrations/      # Migrations
│   └── tests/               # Tests
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages
│   │   ├── store/           # Redux store
│   │   ├── services/        # Services API
│   │   ├── styles/          # Styles CSS
│   │   └── utils/           # Utilitaires
│   └── public/              # Assets statiques
└── docs/                    # Documentation
```

## 🔒 Sécurité

- **Authentification JWT** avec expiration et refresh tokens
- **Hashage bcrypt** des mots de passe (salt rounds: 10)
- **Validation Zod** complète des entrées (tous les endpoints) ✨
- **Rate limiting** sur auth (login/register) et recherche ✨
- **Upload sécurisé** avec whitelist MIME types ✨
- **CORS** configuré
- **URLs signées** pour les téléchargements
- **RBAC** (Role-Based Access Control)
- **Protection XSS, CSRF, SQL Injection**

## 🚀 Déploiement

### Docker
```bash
docker-compose up -d
```

### Vercel (Frontend)
```bash
npm run build
vercel --prod
```

### Railway (Backend)
```bash
railway up
```

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Email** : support@crealith.com
- **Discord** : [Crealith Community](https://discord.gg/crealith)
- **Documentation** : [docs.crealith.com](https://docs.crealith.com)

## 📈 Métriques de Performance

| Métrique | Avant v1.1 | Après v1.1 | Amélioration |
|----------|-----------|------------|--------------|
| Validation API | 0% | 100% | ✅ +100% |
| Cache Redis | ❌ | ✅ Featured | ✅ Implémenté |
| Temps page d'accueil | ~500ms | ~50ms | ✅ -90% |
| Taille composants | 660 lignes | 200 lignes | ✅ -70% |
| Upload sécurisé | ❌ | ✅ | ✅ Sécurisé |

## 🗺️ Roadmap

### ✅ v1.2 (Complétée - Oct 2025)
- [x] ✅ Validation Zod complète
- [x] ✅ Cache Redis avec invalidation
- [x] ✅ Refactoring composants
- [x] ✅ Sécurisation uploads (whitelist MIME)
- [x] ✅ Tokens en cookies httpOnly + rotation
- [x] ✅ Webhook Stripe sécurisé + idempotence
- [x] ✅ Ownership middleware appliqué
- [x] ✅ Rate limiting complet
- [x] ✅ Documentation complète

### 📅 v1.3 (Prochaine - Nov 2025)
- [ ] 🔄 Tests E2E complets
- [ ] 🔄 Pagination curseur
- [ ] 🔄 OpenAPI / Swagger
- [ ] 🔄 Monitoring (Sentry)

Voir [FUTURE_IMPROVEMENTS.md](../docs/FUTURE_IMPROVEMENTS.md) pour la roadmap complète.

---

**Crealith v1.2** - La marketplace digitale sécurisée et performante 🚀

> 📚 **Documentation complète disponible :**
> - [Guide de Démarrage Rapide](../docs/QUICK_START_GUIDE.md)
> - [Résumé des Améliorations](../docs/IMPROVEMENTS_SUMMARY.md)
> - [Guide de Tests de Sécurité](../docs/SECURITY_TESTING_GUIDE.md)
> - [Implémentation Complète](../docs/IMPLEMENTATION_COMPLETE.md)
