# 🔒 Isolation des Produits par Seller - Crealith v1.2.5

**Date :** 1er Octobre 2025  
**Fonctionnalité :** Chaque seller ne voit QUE ses propres produits

---

## 🎯 Objectif

**Sécurité :** Empêcher un seller de voir, modifier ou supprimer les produits d'un autre seller.

**Principe :** Defense in depth (défense en profondeur)
- ✅ Frontend filtre par userId (UX)
- ✅ Backend valide permissions (Sécurité)
- ✅ Ownership middleware (CRUD operations)

---

## 🛡️ Architecture de Sécurité

### Layer 1 : Frontend (UX)
```typescript
// frontend/pages/seller/SellerDashboardPage.tsx
const fetchProducts = async () => {
  const params = {
    userId: user.id, // ✅ Filtre par userId du seller connecté
    page: 1,
    pageSize: 6,
    sortBy: 'createdAt',
    sortDir: 'desc'
  };
  
  const response = await api.get('/products', { params });
  // ✅ Reçoit SEULEMENT les produits du seller
};
```

### Layer 2 : Backend Controller (Validation)
```typescript
// backend/controllers/product.controller.ts
export const getProducts = async (req, res, next) => {
  const user = req.user;
  let userIdFilter = undefined;
  
  if (req.query.userId) {
    const requestedUserId = req.query.userId;
    
    // ✅ Vérification de permission
    if (user.role === 'ADMIN') {
      // Admin peut voir tous les produits
      userIdFilter = requestedUserId;
    } else if (user.userId === requestedUserId) {
      // Seller voit SEULEMENT ses produits
      userIdFilter = requestedUserId;
    } else {
      // ❌ Tentative de voir produits d'un autre seller
      throw createError.forbidden('Vous ne pouvez voir que vos propres produits');
    }
  }
  
  const filters = {
    ...otherFilters,
    userId: userIdFilter // ✅ Filtre appliqué
  };
  
  const result = await productService.getProducts(filters);
  res.json({ success: true, data: result });
};
```

### Layer 3 : Backend Service (Business Logic)
```typescript
// backend/services/product.service.ts
async getProducts(filters: { userId?: string, ... }) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(filters.userId && { userId: filters.userId }), // ✅ Filtre SQL
    // ... autres conditions
  };
  
  const products = await prisma.product.findMany({ where });
  // ✅ Retourne SEULEMENT les produits filtrés
  return products;
}
```

### Layer 4 : Ownership Middleware (Operations)
```typescript
// backend/middleware/auth.middleware.ts
export const requireOwnership = (resourceType: 'product') => {
  return async (req, res, next) => {
    const resourceId = req.params.id;
    const resource = await prisma.product.findUnique({
      where: { id: resourceId },
      select: { userId: true }
    });
    
    // Admin bypass
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // ✅ Vérifier propriété
    if (resource.userId !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Accès non autorisé' 
      });
    }
    
    next();
  };
};
```

---

## 📊 Matrice de Permissions

### GET /api/products

| Scénario | Query String | User Role | User ID | Résultat |
|----------|--------------|-----------|---------|----------|
| Public (tous produits) | `?page=1` | Visitor | - | ✅ Tous produits actifs |
| Seller (ses produits) | `?userId=seller1` | SELLER | seller1 | ✅ Produits de seller1 |
| Seller (autre seller) | `?userId=seller2` | SELLER | seller1 | ❌ 403 Forbidden |
| Admin (tous) | `?page=1` | ADMIN | admin1 | ✅ Tous produits |
| Admin (filtre seller) | `?userId=seller1` | ADMIN | admin1 | ✅ Produits de seller1 |

### PUT/DELETE /api/products/:id

| Scénario | Product Owner | User | User Role | Résultat |
|----------|---------------|------|-----------|----------|
| Modifier son produit | seller1 | seller1 | SELLER | ✅ 200 OK |
| Modifier produit autre | seller2 | seller1 | SELLER | ❌ 403 Forbidden |
| Admin modifie tout | seller1 | admin | ADMIN | ✅ 200 OK |

---

## 🧪 Tests de Validation

### Test 1 : Seller Voit Seulement Ses Produits

**Setup :**
```
Seller A (Bethel): cmg6ldnit0001vcpe01c6yxgb
  - bethel-prod-1
  - bethel-prod-2
  - bethel-prod-3

Seller B (Admin): cmg6nh6800000egi9okn4b3pj
  - produit 1
  - produit 2
  - ... (10+ produits)
```

**Test :**
```bash
# 1. Connecté en tant que Bethel
GET /api/products?userId=cmg6ldnit0001vcpe01c6yxgb
# ✅ Retourne 3 produits (bethel-prod-*)

# 2. Dashboard Seller affiche
# ✅ "Mes Produits (3)"
# ✅ Liste: bethel-prod-1, bethel-prod-2, bethel-prod-3
# ❌ Ne montre PAS les produits d'Admin
```

### Test 2 : Seller Essaie de Voir Produits d'un Autre

**Test :**
```bash
# Connecté en tant que Bethel (cmg6ldnit0001vcpe01c6yxgb)
GET /api/products?userId=cmg6nh6800000egi9okn4b3pj

# ✅ Résultat attendu: 403 Forbidden
{
  "success": false,
  "message": "Vous ne pouvez voir que vos propres produits"
}
```

### Test 3 : Visiteur Public (Sans Auth)

**Test :**
```bash
# Non authentifié
GET /api/products?page=1

# ✅ Retourne tous produits actifs (toutes vendors)
# ✅ Pagination normale

# Essayer avec userId
GET /api/products?userId=cmg6ldnit0001vcpe01c6yxgb

# ✅ Résultat: userId ignoré (userIdFilter = undefined)
# ✅ Retourne tous produits publics
```

### Test 4 : Admin Voit Tous les Produits

**Test :**
```bash
# Connecté en tant qu'ADMIN
GET /api/products?page=1

# ✅ Tous produits (tous sellers)

# Filtrer par seller spécifique
GET /api/products?userId=cmg6ldnit0001vcpe01c6yxgb

# ✅ Produits de Bethel uniquement
# ✅ Admin peut filtrer par n'importe quel seller
```

### Test 5 : Modification Cross-Seller (Sécurité)

**Test :**
```bash
# Bethel essaie de modifier produit d'Admin
PUT /api/products/9
{
  "title": "Hacked Title"
}

# ✅ 403 Forbidden (requireOwnership middleware)
# ✅ Produit non modifié
# ✅ Log "Unauthorized Access Attempt"
```

---

## 🔐 Code Implémenté

### 1. Backend Controller

**Fichier :** `backend/src/controllers/product.controller.ts`

```typescript
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    
    // Vérification de permission pour filtre userId
    let userIdFilter: string | undefined = undefined;
    if (req.query.userId) {
      const requestedUserId = req.query.userId as string;
      
      if (user && (user.role === 'ADMIN' || user.userId === requestedUserId)) {
        userIdFilter = requestedUserId;
      } else if (!user) {
        userIdFilter = undefined; // Visiteur: pas de filtre userId
      } else {
        throw createError.forbidden('Vous ne pouvez voir que vos propres produits');
      }
    }
    
    const filters = {
      categoryId: req.query.categoryId as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      isFeatured: req.query.isFeatured === 'true',
      isActive: req.query.isActive !== 'false',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
      sortBy: req.query.sortBy as 'price' | 'createdAt' | 'downloadsCount',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      userId: userIdFilter, // ✅ Filtre sécurisé
    };

    const result = await productService.getProducts(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

### 2. Route Product

**Fichier :** `backend/src/routes/product.routes.ts`

```typescript
// GET /api/products
router.get(
  '/',
  // ⚠️ PAS de requireAuth ici (route publique)
  // ✅ Controller gère permissions selon contexte
  validate(productQuerySchema, 'query'),
  getProducts
);

// PUT /api/products/:id
router.put(
  '/:id',
  requireAuth,
  requireSeller,
  requireOwnership('product'), // ✅ Vérifie propriété
  upload.fields([...]),
  validate(updateProductSchema),
  updateProduct
);

// DELETE /api/products/:id
router.delete(
  '/:id',
  requireAuth,
  requireSeller,
  requireOwnership('product'), // ✅ Vérifie propriété
  validate(idParamSchema, 'params'),
  deleteProduct
);
```

---

## ✅ Avantages de Cette Architecture

### 1. Défense en Profondeur
```
Frontend Filter → Controller Validation → Service Logic → DB Query → Ownership Check
     (UX)              (Security)          (Business)      (Data)      (Operations)
```

### 2. Séparation des Responsabilités
- **Frontend :** Affiche seulement ce qui concerne l'utilisateur (UX)
- **Backend :** Applique les règles métier et sécurité
- **Middleware :** Vérifie ownership pour CRUD operations

### 3. Flexibilité
- Admin peut voir tous les produits
- Seller voit seulement ses produits
- Visiteur voit tous les produits publics
- API reste RESTful et réutilisable

### 4. Audit Trail
```typescript
// Logs automatiques
warn: Unauthorized Access Attempt {
  "method": "DELETE",
  "url": "/api/products/9",
  "userId": "cmg6ldnit0001vcpe01c6yxgb",
  "statusCode": 403
}
```

---

## 🎓 Principes de Sécurité Appliqués

### 1. Principle of Least Privilege
- Chaque utilisateur a accès SEULEMENT à ce dont il a besoin
- Seller voit ses produits, pas ceux des autres

### 2. Defense in Depth
- Multiples couches de vérification
- Si frontend est compromis, backend protège

### 3. Fail Secure
- En cas de doute, refuser l'accès (403)
- Pas de filtre userId = tous produits publics (safe)

### 4. Audit & Monitoring
- Logs de toutes tentatives non autorisées
- Traçabilité des actions

---

## 📝 Checklist Finale

- [x] ✅ Controller valide permissions userId
- [x] ✅ Seller voit SEULEMENT ses produits
- [x] ✅ 403 si tentative voir produits autre seller
- [x] ✅ Admin peut voir tous produits
- [x] ✅ Visiteur voit produits publics
- [x] ✅ requireOwnership middleware actif
- [x] ✅ Logs unauthorized attempts
- [x] ✅ Tests validation OK
- [x] ✅ Compilation TypeScript OK

---

**Status :** ✅ ISOLATION SELLER COMPLÈTE  
**Sécurité :** ✅ Multi-Layer Protection  
**Tests :** ✅ Tous scénarios validés

