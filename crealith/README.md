# Crealith - Digital E-commerce Platform

## Structure
- `backend/` - Node.js API avec PostgreSQL
- `frontend/` - React.js avec TypeScript

## Démarrage Rapide

### 1. Lancer la base de données
```bash
docker-compose up -d postgres
```

### 2. Setup Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma seed
npm run dev
```

### 3. Setup Frontend  
```bash
cd frontend
npm install
npm run dev
```

## URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health
