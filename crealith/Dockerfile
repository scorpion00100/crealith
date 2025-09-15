# Multi-stage build pour optimiser la taille de l'image
FROM node:20-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de configuration des packages
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Stage 1: Build du backend
FROM base AS backend-builder
WORKDIR /app/backend

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY backend/ .

# Générer le client Prisma
RUN npx prisma generate

# Build de l'application
RUN npm run build

# Stage 2: Build du frontend
FROM base AS frontend-builder
WORKDIR /app/frontend

# Installer les dépendances
RUN npm ci && npm cache clean --force

# Copier le code source
COPY frontend/ .

# Build de l'application
RUN npm run build

# Stage 3: Image de production
FROM node:20-alpine AS production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Installer les dépendances système
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de configuration
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Installer les dépendances de production
WORKDIR /app/backend
RUN npm ci --only=production && npm cache clean --force

# Copier les builds
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=frontend-builder /app/frontend/dist ./public

# Copier les fichiers de configuration
COPY backend/.env.example ./.env.example

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 5000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Commande de démarrage
CMD ["node", "dist/server.js"]
