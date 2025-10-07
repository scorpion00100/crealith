# 🔄 PHASE 3 - REFACTORING & FINITIONS

**Durée estimée :** 45 minutes  
**Risque :** 🟢 Faible (refactoring uniquement)  
**Prérequis :** ✅ Phases 1 & 2 complétées

---

## 🎯 OBJECTIFS PHASE 3

### 1️⃣ Nettoyage auth.service.ts (20 min)
- Supprimer la logique de test du code production
- Créer un mock service séparé pour tests
- Code plus propre et maintenable

### 2️⃣ Upload ImageKit (15 min)
- Implémenter vraie intégration ImageKit
- Upload fichiers + thumbnails vers CDN
- Gestion des erreurs et fallback

### 3️⃣ Routes Produits (5 min)
- Endpoint POST `/products/:id/restore`
- Endpoint DELETE `/products/:id/permanent` (admin)

### 4️⃣ Validation Zod (5 min)
- Schéma pour cancel order
- Validation du champ reason

---

## 📦 FICHIERS À MODIFIER

### Backend
- [ ] `services/auth.service.ts` - Nettoyage tests
- [ ] `services/product.service.ts` - ImageKit upload
- [ ] `controllers/product.controller.ts` - Restore/hard delete
- [ ] `routes/product.routes.ts` - Nouvelles routes
- [ ] `utils/validation.ts` - Schéma cancel order
- [ ] `__tests__/mocks/auth.service.mock.ts` - NOUVEAU

**Total : 6 fichiers**

---

## 🚀 BÉNÉFICES ATTENDUS

- 🧹 Code plus propre (pas de `if (NODE_ENV === 'test')`)
- 📦 Tests isolés (mock séparé)
- 🖼️ CDN ImageKit (performance uploads)
- ✅ API complète (restore + permanent delete)
- 🔒 Validation renforcée (Zod)

---

**Démarrage Phase 3...** 🎯

