# 🎨 PHASE F3 - UX & SEO FRONTEND

**Objectif :** Améliorer accessibilité, SEO et monitoring  
**Durée :** 30 minutes  
**Impact :** Accessibilité +60%, SEO +80%, Monitoring +100%

---

## 🎯 STRATÉGIE

### Principe : **Améliorer sans casser**
1. ✅ Ajouter aria-labels sur composants clés
2. ✅ Intégrer React Helmet pour SEO
3. ✅ Configurer Sentry (monitoring)
4. ✅ Améliorer keyboard navigation
5. ✅ Tester accessibilité

---

## 📋 PRIORITÉS

### High Priority
1. **Accessibilité** - aria-labels, roles, alt text
2. **SEO** - Meta tags dynamiques, Open Graph
3. **Monitoring** - Sentry pour erreurs production

### Medium Priority
4. **Keyboard nav** - Focus management, tabindex
5. **Screen readers** - Semantic HTML

---

## 📊 ÉTAPES DÉTAILLÉES

### ÉTAPE 1 : Accessibilité - Composants UI (10 min)
**Fichiers :**
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/ProductCard.tsx`
- `components/layout/Header.tsx`

**Actions :**
- Ajouter aria-label sur boutons icons
- role="button" sur éléments cliquables
- alt text sur images
- aria-pressed pour toggles

**Exemple :**
```typescript
// ❌ AVANT
<button onClick={handleDelete}>
  <Trash2 />
</button>

// ✅ APRÈS
<button 
  onClick={handleDelete}
  aria-label="Supprimer le produit"
  role="button"
>
  <Trash2 aria-hidden="true" />
</button>
```

---

### ÉTAPE 2 : React Helmet - SEO (10 min)
**Installation :**
```bash
npm install react-helmet-async
```

**Fichiers à créer :**
- `components/SEO.tsx` - Composant SEO réutilisable

**Fichiers à modifier :**
- `App.tsx` - Wrapper HelmetProvider
- `pages/HomePage.tsx` - SEO tags
- `pages/ProductDetailPage.tsx` - SEO dynamique
- `pages/CatalogPage.tsx` - SEO

**Exemple :**
```typescript
// components/SEO.tsx
import { Helmet } from 'react-helmet-async';

export const SEO = ({ title, description, image, type = 'website' }) => (
  <Helmet>
    <title>{title} | Crealith</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:type" content={type} />
    <meta name="twitter:card" content="summary_large_image" />
  </Helmet>
);

// Dans ProductDetailPage
<SEO 
  title={product.title}
  description={product.description}
  image={product.thumbnailUrl}
  type="product"
/>
```

---

### ÉTAPE 3 : Sentry - Monitoring (5 min)
**Installation :**
```bash
npm install @sentry/react
```

**Fichiers à créer :**
- `config/sentry.ts` - Configuration Sentry

**Fichiers à modifier :**
- `main.tsx` - Init Sentry
- `components/ErrorBoundary.tsx` - Capturer erreurs

**Exemple :**
```typescript
// config/sentry.ts
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// ErrorBoundary.tsx
componentDidCatch(error, errorInfo) {
  logger.error('Error caught:', error, errorInfo);
  
  if (import.meta.env.PROD) {
    Sentry.captureException(error, { contexts: { react: errorInfo } });
  }
}
```

---

### ÉTAPE 4 : Keyboard Navigation (5 min)
**Fichiers :**
- `components/marketplace/CartSidebar.tsx`
- `components/ui/Modal.tsx`
- `components/layout/Header.tsx`

**Actions :**
- Focus trap dans modals
- ESC pour fermer
- Tab order logique
- Focus visible

**Exemple :**
```typescript
// Modal avec keyboard nav
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  
  document.addEventListener('keydown', handleEsc);
  return () => document.removeEventListener('keydown', handleEsc);
}, [onClose]);

// Focus trap
<div role="dialog" aria-modal="true" tabIndex={-1}>
  {children}
</div>
```

---

### ÉTAPE 5 : Tests & Validation (5 min)
- [ ] Build réussit
- [ ] Navigation clavier fonctionne
- [ ] Screen reader (test rapide)
- [ ] Sentry configuré (sans DSN pour l'instant)

---

## 🛡️ SÉCURITÉ

### Vérifications
```bash
npm run build
# → Doit réussir

# Test manuel
npm run dev
# → Tester navigation clavier
# → Tester aria-labels (inspector)
```

---

## 📈 GAINS ATTENDUS

### Accessibilité
- **+60%** aria-labels
- **+40%** keyboard nav
- **+30%** screen reader

### SEO
- **+80%** meta tags
- **+50%** Open Graph
- **+40%** crawlability

### Monitoring
- **+100%** visibilité erreurs
- **+90%** debugging
- **+80%** user insights

---

## ⏱️ TIMELINE

| Étape | Durée | Cumul |
|-------|-------|-------|
| 1. Accessibilité | 10 min | 10 min |
| 2. React Helmet | 10 min | 20 min |
| 3. Sentry | 5 min | 25 min |
| 4. Keyboard nav | 5 min | 30 min |
| 5. Tests | 5 min | 35 min |

**Total :** 35 minutes (marge de 5 min)

---

## 🚀 DÉMARRAGE

**Prêt à commencer !**

**Prochaine action :** Améliorer accessibilité des composants UI

