# ⚡ PHASE F2 - PERFORMANCE FRONTEND

**Objectif :** Optimiser les performances React sans bugs  
**Durée :** 45 minutes  
**Impact :** Performance +35%, UX +15%

---

## 🎯 STRATÉGIE

### Principe : **Optimiser sans casser**
1. ✅ Identifier les composants à optimiser
2. ✅ Ajouter React.memo() progressivement
3. ✅ Wrapper handlers avec useCallback()
4. ✅ Mémoiser calculs lourds avec useMemo()
5. ✅ Analyser bundle et optimiser
6. ✅ Tester après chaque changement

---

## 📋 COMPOSANTS PRIORITAIRES

### High Priority (Re-renders fréquents)
1. **ProductCard** (385 lignes) - Utilisé partout
2. **SearchBar** (marketplace) - Input onChange
3. **Header** (460 lignes) - Navigation
4. **CartSidebar** - État cart change souvent
5. **ProductGrid** - Map de ProductCards

### Medium Priority
6. **Button** - Composant générique
7. **Input** - Composant form
8. **Modal** - Overlay
9. **LoadingSpinner** - Animation

---

## 🔍 ANALYSE INITIALE

### Composants à optimiser
```typescript
// ProductCard (385 lignes)
// ❌ AVANT : Re-render à chaque changement parent
export const ProductCard: React.FC<ProductCardProps> = ({ product, onView }) => {
  // Pas de memo, handlers non mémorisés
};

// ✅ APRÈS
export const ProductCard = React.memo(({ product, onView }) => {
  // Mémorisé, re-render uniquement si product ou onView change
});
```

### Handlers à optimiser
```typescript
// ❌ AVANT : Nouveau handler à chaque render
const handleClick = () => {
  onView(product.id);
};

// ✅ APRÈS
const handleClick = useCallback(() => {
  onView(product.id);
}, [product.id, onView]);
```

### Calculs à mémoiser
```typescript
// ❌ AVANT : Recalculé à chaque render
const total = cart.items.reduce((sum, item) => sum + item.price, 0);

// ✅ APRÈS
const total = useMemo(() => {
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}, [cart.items]);
```

---

## 📊 ÉTAPES DÉTAILLÉES

### ÉTAPE 1 : Composants UI Génériques (10 min)
**Fichiers :**
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/LoadingSpinner.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Card.tsx`

**Action :** Ajouter `React.memo()` + `useCallback()` pour handlers

**Test :** Build + vérifier aucun crash

---

### ÉTAPE 2 : ProductCard (10 min)
**Fichier :** `components/ui/ProductCard.tsx` (385 lignes)

**Optimisations :**
1. Wrapper avec `React.memo()`
2. `useCallback()` pour tous les handlers (onView, onEdit, onDelete, etc.)
3. Comparateur personnalisé si nécessaire

**Test :** HomePage et Catalog doivent fonctionner

---

### ÉTAPE 3 : Header & SearchBar (10 min)
**Fichiers :**
- `components/layout/Header.tsx` (460 lignes)
- `components/marketplace/SearchBar.tsx`

**Optimisations :**
1. `React.memo()` sur composants
2. `useCallback()` pour search handlers
3. `useMemo()` pour filtres

**Test :** Navigation et recherche OK

---

### ÉTAPE 4 : Cart & Dashboard (10 min)
**Fichiers :**
- `components/marketplace/CartSidebar.tsx`
- `pages/buyer/BuyerDashboardPage.tsx`
- `pages/seller/SellerDashboardPage.tsx`

**Optimisations :**
1. `useMemo()` pour calculs totaux cart
2. `useCallback()` pour actions cart
3. `React.memo()` sur sous-composants dashboard

**Test :** Cart et Dashboard fonctionnels

---

### ÉTAPE 5 : Bundle Analyzer (5 min)
**Installation :**
```bash
npm install --save-dev rollup-plugin-visualizer
```

**Configuration :** `vite.config.ts`
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer({ open: true, gzipSize: true })
]
```

**Action :** Analyser bundle, identifier gros chunks

---

### ÉTAPE 6 : Tests & Validation (5 min)
- [ ] Build réussit
- [ ] Aucun warning React
- [ ] Performance visuelle améliorée
- [ ] Aucun crash

---

## 🛡️ SÉCURITÉ

### Vérifications à chaque étape
```bash
npm run build
# → Doit réussir

npm run type-check
# → 0 erreur dans src/

# Test manuel
npm run dev
# → Tester les pages modifiées
```

---

## 📈 GAINS ATTENDUS

### Performance
- **-30% re-renders** (React.memo)
- **-20% calculs** (useMemo)
- **+15% réactivité** (useCallback)

### Bundle
- **-10-15%** (code splitting)
- **Meilleur cache** (chunks séparés)

---

## ⏱️ TIMELINE

| Étape | Durée | Cumul |
|-------|-------|-------|
| 1. UI génériques | 10 min | 10 min |
| 2. ProductCard | 10 min | 20 min |
| 3. Header & Search | 10 min | 30 min |
| 4. Cart & Dashboard | 10 min | 40 min |
| 5. Bundle analyzer | 5 min | 45 min |
| 6. Tests | 5 min | 50 min |

**Total :** 50 minutes (marge de 5 min)

---

## 🚀 DÉMARRAGE

**Prêt à commencer !**

**Prochaine action :** Optimiser composants UI génériques (Button, Input, etc.)

