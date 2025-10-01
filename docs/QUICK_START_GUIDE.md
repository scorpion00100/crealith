# 🚀 Guide de Démarrage Rapide - Crealith v1.2

## Installation et Configuration

### 1. Prérequis

```bash
# Node.js 18+ et npm
node --version  # v18+
npm --version   # 9+

# PostgreSQL 14+
psql --version

# Redis 6+
redis-cli --version
```

### 2. Installation

```bash
# Backend
cd crealith/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configuration

#### Backend `.env`

```bash
cd crealith/backend
cp env.example .env
```

Générez des secrets sécurisés :
```bash
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 32)" >> .env
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> .env
```

#### Variables requises :
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/crealith
JWT_ACCESS_SECRET=<généré ci-dessus>
JWT_REFRESH_SECRET=<généré ci-dessus>
REDIS_HOST=localhost
REDIS_PORT=6379
STRIPE_SECRET_KEY=sk_test_votre_clé
STRIPE_WEBHOOK_SECRET=whsec_votre_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Démarrage

```bash
# Terminal 1 - Redis
redis-server

# Terminal 2 - Backend
cd crealith/backend
npm run dev

# Terminal 3 - Frontend
cd crealith/frontend
npm run dev
```

### 5. Tests Rapides

#### Validation Zod
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"short"}'
```

Attendu : Erreur validation explicite

#### Cache Redis
```bash
redis-cli keys "products:*"
```

Attendu : Clés de cache après visite page d'accueil

---

Voir `SECURITY_TESTING_GUIDE.md` pour tests complets.
