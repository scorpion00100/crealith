# 🔮 Améliorations Futures - Crealith

Ce document liste les améliorations recommandées à implémenter dans les prochaines itérations du projet.

---

## 🔴 Priorité HAUTE (Prochaine Sprint)

### 1. Sécurisation Complète des Tokens

**Objectif :** Passer les refresh tokens en cookies httpOnly

**Tâches :**
- [ ] Modifier `/api/auth/login` pour retourner refresh token en cookie httpOnly
- [ ] Modifier `/api/auth/refresh` pour lire depuis le cookie
- [ ] Implémenter la rotation des refresh tokens (nouveau token à chaque refresh)
- [ ] Ajouter blacklist Redis pour tokens révoqués
- [ ] Invalider tous les tokens lors du changement de mot de passe
- [ ] Tests de sécurité (tentative de vol de token)

**Fichiers à modifier :**
```
backend/src/routes/auth.routes.ts
backend/src/services/auth.service.ts
backend/src/utils/jwt.ts
frontend/src/services/api.ts
frontend/src/services/auth.service.ts
```

**Estimation :** 1-2 jours

---

### 2. Webhook Stripe Sécurisé

**Objectif :** Vérifier les signatures Stripe et implémenter l'idempotence

**Tâches :**
- [ ] Vérifier la signature webhook avec `stripe.webhooks.constructEvent`
- [ ] Implémenter l'idempotence avec Redis (clé: `webhook:${event.id}`)
- [ ] Gérer tous les events importants (payment_intent.succeeded, payment_intent.failed, etc.)
- [ ] Logger tous les webhooks reçus
- [ ] Tests avec Stripe CLI (`stripe listen --forward-to`)

**Code exemple :**
```typescript
// routes/webhook.routes.ts
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  // Vérifier idempotence
  const processed = await redisService.cacheGet(`webhook:${event.id}`);
  if (processed) {
    return res.json({ received: true });
  }

  // Traiter l'event
  await handleStripeEvent(event);

  // Marquer comme traité (TTL 7 jours)
  await redisService.cacheSet(`webhook:${event.id}`, true, 7 * 24 * 60 * 60);

  res.json({ received: true });
});
```

**Estimation :** 1 jour

---

### 3. Ownership Middleware Complet

**Objectif :** Vérifier systématiquement la propriété des ressources

**Tâches :**
- [ ] Compléter `requireOwnership` dans `auth.middleware.ts`
- [ ] Appliquer sur toutes les routes de modification/suppression :
  - [ ] `PUT /api/products/:id`
  - [ ] `DELETE /api/products/:id`
  - [ ] `PUT /api/reviews/:id`
  - [ ] `DELETE /api/reviews/:id`
- [ ] Tests unitaires pour chaque route protégée
- [ ] Tests d'attaque (utilisateur A essaie de modifier ressource de B)

**Code exemple :**
```typescript
export const requireOwnership = (resourceType: 'product' | 'review') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const userId = req.user?.userId;

    const resource = await prisma[resourceType].findUnique({
      where: { id: resourceId },
      select: { userId: true }
    });

    if (!resource || resource.userId !== userId) {
      return next(createError.forbidden('Not authorized'));
    }

    next();
  };
};
```

**Estimation :** 0.5 jour

---

## 🟡 Priorité MOYENNE (Dans 2-3 semaines)

### 4. Pagination Curseur

**Objectif :** Remplacer offset pagination par cursor-based

**Avantages :**
- Performance constante même avec beaucoup de données
- Pas de doublons lors de l'insertion de nouvelles données
- Idéal pour infinite scroll

**Implémentation :**
```typescript
// Avant (offset)
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit
});

// Après (cursor)
const products = await prisma.product.findMany({
  take: limit,
  ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  orderBy: { createdAt: 'desc' }
});

return {
  products,
  nextCursor: products[products.length - 1]?.id,
  hasMore: products.length === limit
};
```

**Fichiers à modifier :**
```
backend/src/services/product.service.ts
backend/src/services/search.service.ts
backend/src/controllers/product.controller.ts
frontend/src/services/product.service.ts
frontend/src/hooks/useInfiniteProducts.ts (nouveau)
```

**Estimation :** 2 jours

---

### 5. Tests Backend Complets

**Objectif :** Couverture > 70% sur le code critique

**Tests prioritaires :**
- [ ] Auth flow complet (register → verify → login → refresh → logout)
- [ ] Ownership checks (vendeur A ne peut pas modifier produit de vendeur B)
- [ ] Checkout complet (panier → checkout → paiement → download)
- [ ] Rate limiting (doit bloquer après N requêtes)
- [ ] Validation Zod (toutes les routes)
- [ ] Cache Redis (hit, miss, invalidation)

**Structure :**
```
backend/src/__tests__/
├── integration/
│   ├── auth.flow.test.ts
│   ├── checkout.flow.test.ts
│   └── seller.flow.test.ts
├── unit/
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── product.service.test.ts
│   │   └── order.service.test.ts
│   └── middleware/
│       ├── validation.test.ts
│       └── ownership.test.ts
└── e2e/
    └── critical-paths.test.ts
```

**Estimation :** 3-4 jours

---

### 6. OpenAPI / Swagger Génération

**Objectif :** Documentation API auto-générée et client typé

**Outils :**
- `@nestjs/swagger` ou `tsoa` pour génération auto
- `openapi-typescript-codegen` pour client frontend

**Étapes :**
1. Installer et configurer Swagger
2. Annoter les routes avec décorateurs
3. Générer `openapi.json`
4. Générer client TypeScript pour le frontend
5. Remplacer les services manuels par le client généré

**Bénéfices :**
- Documentation toujours à jour
- Types partagés front/back
- Moins d'erreurs de typage
- Contrat API clair

**Estimation :** 2-3 jours

---

## 🟢 Priorité BASSE (Backlog)

### 7. UI Optimiste

**Objectif :** Améliorer l'UX avec des updates immédiates

**Fonctionnalités :**
- [ ] Favoris : ajouter/retirer sans attendre la réponse
- [ ] Panier : mise à jour immédiate de la quantité
- [ ] Rollback automatique en cas d'erreur

**Implémentation React Query :**
```typescript
const { mutate } = useMutation({
  mutationFn: addToFavorites,
  onMutate: async (productId) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['favorites']);

    // Snapshot
    const previous = queryClient.getQueryData(['favorites']);

    // Optimistic update
    queryClient.setQueryData(['favorites'], (old) => [...old, product]);

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback
    queryClient.setQueryData(['favorites'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['favorites']);
  }
});
```

**Estimation :** 2 jours

---

### 8. États Vides Cohérents

**Objectif :** Composants pour tous les états vides

**Composants à créer :**
```tsx
<EmptyState
  icon={<ShoppingCart />}
  title="Votre panier est vide"
  description="Explorez notre catalogue et ajoutez des produits"
  action={
    <Button onClick={() => navigate('/catalog')}>
      Voir le catalogue
    </Button>
  }
/>
```

**États à couvrir :**
- [ ] Panier vide
- [ ] Favoris vide
- [ ] Aucun résultat de recherche
- [ ] Aucun produit vendeur
- [ ] Aucune commande
- [ ] Aucun avis

**Estimation :** 1 jour

---

### 9. Monitoring et Observabilité

**Outils recommandés :**
- **Sentry** : Tracking d'erreurs
- **LogRocket** : Session replay
- **Prometheus + Grafana** : Métriques système
- **Datadog APM** : Application Performance Monitoring

**Métriques à tracker :**
- Taux d'erreur par endpoint
- Temps de réponse (p50, p95, p99)
- Utilisation Redis (hit rate)
- Taux de conversion (panier → checkout → paiement)

**Configuration Sentry :**
```typescript
// backend/src/app.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Ne pas logger les erreurs 4xx
    if (event.contexts?.response?.status_code < 500) {
      return null;
    }
    return event;
  }
});

// Métriques custom
Sentry.metrics.increment('product.created');
Sentry.metrics.distribution('checkout.duration', duration);
```

**Estimation :** 1-2 jours

---

### 10. Fonctionnalités E-commerce Avancées

**Codes Promo**
- [ ] Modèle `Coupon` (code, type, valeur, expiration)
- [ ] Validation au checkout
- [ ] Stats d'utilisation

**Wishlist Publique**
- [ ] URL partageable (`/wishlist/:userId`)
- [ ] Mode privé/public

**Système de Badges Vendeur**
- [ ] Badge "Vérifié" (KYC)
- [ ] Badge "Top Seller" (critères: ventes > X, note > Y)
- [ ] Badge "Nouveauté" (< 3 mois)

**Notifications Email**
- [ ] Confirmation de commande
- [ ] Téléchargement disponible
- [ ] Nouveau message vendeur
- [ ] Promotion produit favori

**Programme d'Affiliation**
- [ ] Code affilié par utilisateur
- [ ] Tracking des ventes
- [ ] Commission configurable
- [ ] Dashboard affilié

**Estimation :** 1-2 semaines

---

### 11. Internationalisation (i18n)

**Objectif :** Support multi-langue

**Outils :**
- `react-i18next` pour le frontend
- `i18next` pour le backend (emails)

**Langues prioritaires :**
1. Français (par défaut)
2. Anglais
3. Espagnol

**Fichiers de traduction :**
```
frontend/src/locales/
├── fr/
│   ├── common.json
│   ├── auth.json
│   ├── products.json
│   └── checkout.json
├── en/
│   └── ...
└── es/
    └── ...
```

**Estimation :** 3-4 jours

---

### 12. Progressive Web App (PWA)

**Objectif :** Installation sur mobile et offline support

**Fonctionnalités :**
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Cache des images
- [ ] Mode offline (consultation produits)
- [ ] Push notifications (nouvelles commandes vendeur)

**Estimation :** 2-3 jours

---

## 📊 Roadmap Visuelle

```
Mois 1 (Octobre 2025)
├── Semaine 1: ✅ Audit + Validation Zod + Cache Redis
├── Semaine 2: 🔴 Tokens sécurisés + Webhook Stripe
├── Semaine 3: 🔴 Ownership + Tests critiques
└── Semaine 4: 🟡 Pagination curseur

Mois 2 (Novembre 2025)
├── Semaine 1: 🟡 OpenAPI + Client typé
├── Semaine 2: 🟡 Tests E2E + Monitoring
├── Semaine 3: 🟢 UI Optimiste + États vides
└── Semaine 4: 🟢 Fonctionnalités e-commerce

Mois 3 (Décembre 2025)
├── Semaine 1-2: 🟢 i18n
├── Semaine 3: 🟢 PWA
└── Semaine 4: 🎉 Release v2.0
```

---

## 🎯 KPIs à Suivre

### Performance
- **Temps de réponse API** : < 200ms (p95)
- **Temps de chargement page** : < 2s
- **Cache hit rate** : > 80% (produits featured)

### Qualité
- **Couverture tests** : > 70%
- **Taux d'erreur** : < 1%
- **TypeScript strict mode** : 100%

### Business
- **Taux de conversion** : panier → checkout → paiement
- **Taux de rétention** : utilisateurs actifs 30 jours
- **NPS (Net Promoter Score)** : > 50

---

## 📚 Ressources

### Documentation
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Zod Documentation](https://zod.dev/)

### Outils
- **Stripe CLI** : `stripe listen --forward-to localhost:5000/api/webhook/stripe`
- **Redis Commander** : GUI pour visualiser Redis
- **Prisma Studio** : GUI pour visualiser la DB
- **Postman** : Collection d'API

---

**Note :** Ce document est vivant et doit être mis à jour régulièrement en fonction des priorités business et des retours utilisateurs.

**Dernière mise à jour :** 1er Octobre 2025

