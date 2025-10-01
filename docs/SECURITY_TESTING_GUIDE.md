# 🔒 Guide de Test des Fonctionnalités de Sécurité - Crealith

Ce guide vous permet de tester les nouvelles fonctionnalités de sécurité implémentées.

---

## 🎯 Tests à Effectuer

### 1. ✅ Tokens sécurisés (httpOnly Cookies + Rotation)

#### Test 1.1 : Refresh token en cookie httpOnly

**Objectif :** Vérifier que le refresh token est bien stocké en cookie httpOnly

```bash
# 1. Se connecter
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }' \
  -c cookies.txt \
  -v
```

**Vérifications :**
- ✅ Le header de réponse contient `Set-Cookie: refreshToken=...; HttpOnly; Path=/api/auth`
- ✅ Le cookie a l'attribut `HttpOnly` (non accessible via JavaScript)
- ✅ Le cookie a l'attribut `Secure` en production
- ✅ Le cookie a `SameSite=Lax` pour protection CSRF

**Voir les cookies :**
```bash
cat cookies.txt
```

#### Test 1.2 : Rotation du refresh token

**Objectif :** Vérifier que le refresh token change à chaque refresh

```bash
# 1. Récupérer le premier refresh token
REFRESH_TOKEN_1=$(cat cookies.txt | grep refreshToken | awk '{print $7}')
echo "Token 1: $REFRESH_TOKEN_1"

# 2. Attendre 2 secondes
sleep 2

# 3. Refresh le token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: CSRF_TOKEN_FROM_COOKIE" \
  -b cookies.txt \
  -c cookies.txt

# 4. Récupérer le nouveau refresh token
REFRESH_TOKEN_2=$(cat cookies.txt | grep refreshToken | awk '{print $7}')
echo "Token 2: $REFRESH_TOKEN_2"

# 5. Vérifier qu'ils sont différents
if [ "$REFRESH_TOKEN_1" != "$REFRESH_TOKEN_2" ]; then
  echo "✅ ROTATION OK : Les tokens sont différents"
else
  echo "❌ ERREUR : Les tokens sont identiques"
fi
```

#### Test 1.3 : Ancien token révoqué

**Objectif :** Vérifier qu'un ancien refresh token ne peut plus être utilisé

```bash
# 1. Essayer d'utiliser l'ancien token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN_1\"}"
```

**Réponse attendue :**
```json
{
  "success": false,
  "error": "Invalid refresh token"
}
```

#### Test 1.4 : Vérification Redis

```bash
# Lister les refresh tokens dans Redis
redis-cli keys "refreshToken:*"

# Voir un token spécifique
redis-cli get "refreshToken:VOTRE_TOKEN"

# Vérifier le TTL
redis-cli ttl "refreshToken:VOTRE_TOKEN"
# Devrait retourner ~604800 (7 jours en secondes)
```

---

### 2. ✅ Webhook Stripe Sécurisé avec Idempotence

#### Test 2.1 : Signature Webhook

**Objectif :** Vérifier que seuls les webhooks signés sont acceptés

```bash
# 1. Envoyer un webhook SANS signature valide
curl -X POST http://localhost:5000/api/webhook/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{
    "id": "evt_test_123",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 1000
      }
    }
  }'
```

**Réponse attendue :**
```json
{
  "error": "Webhook signature verification failed"
}
```

#### Test 2.2 : Tester avec Stripe CLI

**Installation :**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.17.0/stripe_1.17.0_linux_x86_64.tar.gz
tar -xvf stripe_1.17.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Configuration :**
```bash
# Login Stripe
stripe login

# Forward webhooks vers votre API locale
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

**Tester un webhook :**
```bash
# Déclencher un événement de test
stripe trigger payment_intent.succeeded
```

**Vérifications :**
- ✅ Le webhook est reçu avec une signature valide
- ✅ L'événement est traité (logs dans la console)
- ✅ Redis enregistre l'événement

#### Test 2.3 : Idempotence

**Objectif :** Vérifier qu'un même événement n'est traité qu'une fois

```bash
# 1. Envoyer deux fois le même webhook avec Stripe CLI
stripe trigger payment_intent.succeeded

# Attendre la réception du premier

# 2. Envoyer manuellement un deuxième événement avec le même ID
# (Utiliser l'event ID du log précédent)

# 3. Vérifier dans Redis
redis-cli keys "webhook:stripe:*"

# 4. Voir les détails d'un webhook traité
redis-cli get "webhook:stripe:evt_XXXX"
```

**Réponse de la deuxième requête :**
```json
{
  "received": true,
  "alreadyProcessed": true
}
```

#### Test 2.4 : TTL des webhooks

```bash
# Vérifier que le webhook expire après 7 jours
redis-cli ttl "webhook:stripe:evt_XXXX"
# Devrait retourner ~604800 secondes (7 jours)
```

---

### 3. ✅ Ownership Middleware

#### Test 3.1 : Modification de son propre produit (OK)

```bash
# 1. Se connecter en tant que vendeur A
TOKEN_A=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller-a@example.com",
    "password": "Test1234"
  }' | jq -r '.accessToken')

# 2. Créer un produit
PRODUCT_ID=$(curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -F "title=Mon Produit" \
  -F "description=Description" \
  -F "price=9.99" \
  -F "categoryId=CATEGORY_ID" \
  -F "file=@test-file.zip" \
  | jq -r '.data.id')

echo "Produit créé : $PRODUCT_ID"

# 3. Modifier son propre produit (devrait fonctionner)
curl -X PUT http://localhost:5000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Titre modifié"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Titre modifié",
    ...
  }
}
```

#### Test 3.2 : Modification du produit d'un autre vendeur (INTERDIT)

```bash
# 1. Se connecter en tant que vendeur B
TOKEN_B=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller-b@example.com",
    "password": "Test1234"
  }' | jq -r '.accessToken')

# 2. Essayer de modifier le produit du vendeur A (devrait échouer)
curl -X PUT http://localhost:5000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tentative de piratage"
  }'
```

**Réponse attendue :**
```json
{
  "success": false,
  "message": "Accès non autorisé"
}
```

**HTTP Status :** 403 Forbidden

#### Test 3.3 : Suppression (ownership)

```bash
# 1. Vendeur B essaie de supprimer le produit de A (INTERDIT)
curl -X DELETE http://localhost:5000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN_B" \
  -v
```

**Réponse attendue :** 403 Forbidden

```bash
# 2. Vendeur A supprime son propre produit (OK)
curl -X DELETE http://localhost:5000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -v
```

**Réponse attendue :** 200 OK

#### Test 3.4 : Admin peut tout modifier

```bash
# 1. Se connecter en tant qu'admin
TOKEN_ADMIN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin1234"
  }' | jq -r '.accessToken')

# 2. Admin modifie le produit de n'importe quel vendeur (OK)
curl -X PUT http://localhost:5000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modifié par admin"
  }'
```

**Réponse attendue :** 200 OK (admin bypass ownership)

#### Test 3.5 : Ownership sur les Reviews

```bash
# 1. Utilisateur A crée un avis
REVIEW_ID=$(curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer $TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "rating": 5,
    "comment": "Excellent produit"
  }' | jq -r '.data.id')

# 2. Utilisateur B essaie de modifier l'avis de A (INTERDIT)
curl -X PUT http://localhost:5000/api/reviews/$REVIEW_ID \
  -H "Authorization: Bearer $TOKEN_USER_B" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Tentative de modification"
  }'
```

**Réponse attendue :** 403 Forbidden

---

## 📊 Checklist de Tests

### Tokens & Auth
- [ ] Refresh token stocké en cookie httpOnly
- [ ] Cookie avec attribut `Secure` en production
- [ ] Cookie avec `SameSite=Lax`
- [ ] Rotation du refresh token à chaque refresh
- [ ] Ancien token révoqué après rotation
- [ ] Token stocké dans Redis avec TTL 7 jours
- [ ] Logout révoque le refresh token
- [ ] LogoutAll révoque tous les tokens de l'utilisateur

### Webhook Stripe
- [ ] Signature webhook vérifiée
- [ ] Webhook sans signature rejeté (400)
- [ ] Idempotence : même événement traité une seule fois
- [ ] Événement stocké dans Redis (TTL 7 jours)
- [ ] Logs structurés avec SecureLogger
- [ ] Test avec Stripe CLI fonctionne
- [ ] Types d'événements supportés : payment_intent.succeeded, payment_intent.payment_failed, checkout.session.completed

### Ownership Middleware
- [ ] Vendeur peut modifier ses propres produits
- [ ] Vendeur NE PEUT PAS modifier les produits d'un autre
- [ ] Vendeur peut supprimer ses propres produits
- [ ] Vendeur NE PEUT PAS supprimer les produits d'un autre
- [ ] Admin peut modifier/supprimer n'importe quel produit
- [ ] Utilisateur peut modifier ses propres avis
- [ ] Utilisateur NE PEUT PAS modifier les avis d'un autre
- [ ] Ownership vérifié AVANT les autres middlewares
- [ ] Erreur 403 explicite en cas de violation

---

## 🐛 Tests de Sécurité Avancés

### Attaque 1 : Replay Attack (Webhook)

**Objectif :** Vérifier qu'on ne peut pas rejouer un ancien webhook

```bash
# 1. Capturer un webhook valide avec Stripe CLI
# 2. Attendre qu'il soit traité
# 3. Rejouer le même payload avec la même signature

# Devrait échouer avec alreadyProcessed: true
```

### Attaque 2 : Token Fixation

**Objectif :** Vérifier qu'un attaquant ne peut pas fixer un refresh token

```bash
# 1. Attaquant génère un faux refresh token
# 2. Essaie de l'utiliser pour refresh
# 3. Devrait échouer avec "Invalid refresh token"
```

### Attaque 3 : Privilege Escalation

**Objectif :** Vérifier qu'un acheteur ne peut pas modifier un produit

```bash
# 1. Se connecter en tant qu'acheteur (BUYER)
TOKEN_BUYER=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "Test1234"
  }' | jq -r '.accessToken')

# 2. Essayer de modifier un produit
curl -X PUT http://localhost:5000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN_BUYER" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tentative escalation"
  }'
```

**Réponse attendue :** 403 Forbidden (requireSeller échoue avant ownership)

---

## 🔍 Monitoring et Logs

### Vérifier les logs

```bash
# Logs backend
tail -f crealith/backend/logs/combined.log | grep -E "(webhook|ownership|refresh)"

# Logs Redis
redis-cli monitor | grep -E "(webhook|refreshToken)"
```

### Métriques Redis

```bash
# Nombre de webhooks traités
redis-cli keys "webhook:stripe:*" | wc -l

# Nombre de refresh tokens actifs
redis-cli keys "refreshToken:*" | wc -l

# Voir les infos Redis
redis-cli INFO
```

---

## ✅ Résultats Attendus

| Test | Statut | Détails |
|------|--------|---------|
| Tokens httpOnly | ✅ | Cookies sécurisés avec rotation |
| Webhook signature | ✅ | Vérification Stripe obligatoire |
| Webhook idempotence | ✅ | Redis TTL 7 jours |
| Ownership produits | ✅ | Middleware appliqué |
| Ownership reviews | ✅ | Middleware appliqué |
| Admin bypass | ✅ | Admin peut tout modifier |
| Logs structurés | ✅ | SecureLogger utilisé |

---

**Dernière mise à jour :** 1er Octobre 2025  
**Version :** 1.2 - Sécurité Renforcée

