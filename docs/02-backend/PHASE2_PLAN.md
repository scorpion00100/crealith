# 🚀 PHASE 2 - PLAN D'ACTION

**Durée estimée :** 1 heure
**Risque :** 🟡 Moyen (migrations DB)
**Prérequis :** ✅ Phase 1 complétée

---

## 🎯 OBJECTIFS PHASE 2

### 1️⃣ Soft Delete Prisma (30 min)
- Ajouter `deletedAt` et `deletedBy` aux modèles
- Migration base de données
- Modifier les services (product, user, order)
- Méthodes restore/hardDelete

### 2️⃣ Remboursements Stripe (30 min)
- Méthode `cancelOrder()` dans order.service.ts
- Intégration Stripe refunds API
- Transaction de remboursement
- Endpoint POST `/api/orders/:id/cancel`
- Tests de validation

---

## 📦 FICHIERS À MODIFIER

### Nouveaux fichiers
- [ ] Migrations Prisma (auto-générées)

### Fichiers à modifier
- [ ] `prisma/schema.prisma` - Ajouter deletedAt/deletedBy
- [ ] `services/product.service.ts` - Soft delete + restore
- [ ] `services/order.service.ts` - Soft delete + cancelOrder
- [ ] `controllers/order.controller.ts` - Endpoint cancel
- [ ] `routes/order.routes.ts` - Route POST /cancel
- [ ] `utils/validation.ts` - Schema cancel order

**Total : 6 fichiers + migrations**

---

## ⚠️ PRÉCAUTIONS

### Avant de commencer
1. ✅ Backup base de données (recommandé)
2. ✅ Vérifier que le backend tourne
3. ✅ Tester en dev d'abord

### Pendant
- Les migrations sont irréversibles
- Backup automatique Prisma créé
- Tests après chaque modification

---

## 🚀 PRÊT À DÉMARRER

Je vais procéder étape par étape :
1. Backup DB (optionnel mais recommandé)
2. Modifier schema.prisma
3. Créer migrations
4. Modifier les services
5. Tester les endpoints

**C'est parti !** 🎯

