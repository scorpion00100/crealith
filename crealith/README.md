# 🚀 Crealith - Marketplace Digitale

Une marketplace moderne inspirée d'Etsy, dédiée exclusivement aux produits digitaux (ebooks, templates, code, graphismes, etc.).

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Installation](#-installation)
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
- **Stripe** pour les paiements
- **ImageKit** pour le stockage de fichiers
- **Jest** pour les tests

### Base de données
- **PostgreSQL** avec Prisma
- **Indexes optimisés** pour les performances
- **Migrations** automatisées

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
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

### 3. Configuration de la base de données
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### 4. Variables d'environnement
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

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

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

- **Authentification JWT** avec expiration
- **Hashage bcrypt** des mots de passe
- **Rate limiting** sur toutes les routes
- **Validation** des données d'entrée
- **CORS** configuré
- **URLs signées** pour les téléchargements
- **RBAC** (Role-Based Access Control)

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

---

**Crealith** - La marketplace digitale de demain 🚀
