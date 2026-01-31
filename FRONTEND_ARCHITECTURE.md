# 🎨 Architecture Frontend - Analyse & Proposition

## 📊 Analyse des Endpoints Backend

### 1. **Module AUTH (Users)** - `/api/auth/`

| Endpoint | Method | Action | Auth Required |
|----------|--------|--------|---------------|
| `/api/auth/users/register/` | POST | Créer un compte | ❌ Public |
| `/api/auth/users/login/` | POST | Se connecter | ❌ Public |
| `/api/auth/users/logout/` | POST | Se déconnecter | ✅ Oui |
| `/api/auth/users/me/` | GET | Profil utilisateur | ✅ Oui |
| `/api/auth/users/update_profile/` | PUT | Modifier profil | ✅ Oui |
| `/api/auth/users/change_password/` | POST | Changer mot de passe | ✅ Oui |
| `/api/auth/users/delete_account/` | DELETE | Supprimer compte | ✅ Oui |
| `/api/auth/profiles/my_profile/` | GET | Détails profil | ✅ Oui |

**→ 8 endpoints**

---

### 2. **Module SHOP (Products)** - `/api/shop/`

| Endpoint | Method | Action | Filtres/Recherche |
|----------|--------|--------|-------------------|
| `/api/shop/products/` | GET | Liste produits | ✅ gender, master_category, sub_category |
| `/api/shop/products/{id}/` | GET | Détail produit | - |
| `/api/shop/products/?search=` | GET | Recherche | ✅ product_display_name, article_type |

**→ 3 endpoints (lecture seule pour users)**

---

### 3. **Module ORDERS** - `/api/orders/`

| Endpoint | Method | Action | Auth Required |
|----------|--------|--------|---------------|
| `/api/orders/orders/` | GET | Liste commandes user | ✅ Oui |
| `/api/orders/orders/` | POST | Créer commande | ✅ Oui |
| `/api/orders/orders/{id}/` | GET | Détail commande | ✅ Oui |
| `/api/orders/orders/my_orders/` | GET | Mes commandes | ✅ Oui |
| `/api/orders/orders/{id}/cancel_order/` | POST | Annuler commande | ✅ Oui |
| `/api/orders/orders/{id}/mark_as_shipped/` | POST | Marquer expédié | ✅ Admin |
| `/api/orders/orders/{id}/confirm_delivery/` | POST | Confirmer livraison | ✅ Oui |
| `/api/orders/order-items/` | GET | Liste items | ✅ Oui |
| `/api/orders/order-items/{id}/` | GET | Détail item | ✅ Oui |

**→ 9 endpoints**

---

### 4. **Module PAYMENTS (Stripe)** - `/api/payments/`

| Endpoint | Method | Action | Auth Required |
|----------|--------|--------|---------------|
| `/api/payments/payments/` | GET | Liste paiements | ✅ Oui |
| `/api/payments/payments/{id}/` | GET | Détail paiement | ✅ Oui |
| `/api/payments/payments/create_payment_intent/` | POST | Créer intent paiement | ✅ Oui |
| `/api/payments/payments/{id}/confirm/` | GET | Confirmer paiement | ✅ Oui |
| `/api/payments/payments/{id}/status/` | GET | Statut paiement | ✅ Oui |
| `/api/payments/refunds/` | GET | Liste remboursements | ✅ Oui |
| `/api/payments/refunds/{id}/` | GET | Détail remboursement | ✅ Oui |
| `/api/payments/refunds/create_refund/` | POST | Demander remboursement | ✅ Oui |
| `/api/payments/webhook/stripe/` | POST | Webhook Stripe | ❌ Public |

**→ 9 endpoints**

---

## 📈 Récapitulatif Backend

```
Total Endpoints: 29
├── Auth: 8 endpoints
├── Shop: 3 endpoints  
├── Orders: 9 endpoints
└── Payments: 9 endpoints
```

---

## 🎯 Architecture Frontend Proposée

### **Structure Modulaire par Features**

```
frontend/
├── src/
│   ├── features/                    # Modules par fonctionnalité
│   │   ├── auth/                   # ✅ Module Authentification
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   └── PasswordChangeForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   └── SettingsPage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useProfile.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── shop/                   # ✅ Module Boutique
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   ├── ProductSearch.tsx
│   │   │   │   └── ProductDetails.tsx
│   │   │   ├── pages/
│   │   │   │   ├── ShopPage.tsx
│   │   │   │   ├── ProductPage.tsx
│   │   │   │   └── CategoryPage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   └── useProductFilters.ts
│   │   │   ├── services/
│   │   │   │   └── shopService.ts
│   │   │   └── types/
│   │   │       └── product.types.ts
│   │   │
│   │   ├── cart/                   # ✅ Module Panier (State local)
│   │   │   ├── components/
│   │   │   │   ├── CartItem.tsx
│   │   │   │   ├── CartSummary.tsx
│   │   │   │   └── CartDrawer.tsx
│   │   │   ├── pages/
│   │   │   │   └── CartPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCart.ts
│   │   │   └── store/
│   │   │       └── cartStore.ts (Zustand/Redux)
│   │   │
│   │   ├── orders/                 # ✅ Module Commandes
│   │   │   ├── components/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderList.tsx
│   │   │   │   ├── OrderDetails.tsx
│   │   │   │   ├── OrderStatus.tsx
│   │   │   │   └── CheckoutForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── OrdersPage.tsx
│   │   │   │   ├── OrderDetailPage.tsx
│   │   │   │   └── CheckoutPage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useOrders.ts
│   │   │   │   ├── useOrder.ts
│   │   │   │   └── useCheckout.ts
│   │   │   ├── services/
│   │   │   │   └── orderService.ts
│   │   │   └── types/
│   │   │       └── order.types.ts
│   │   │
│   │   └── payments/               # ✅ Module Paiements
│   │       ├── components/
│   │       │   ├── PaymentForm.tsx (Stripe Elements)
│   │       │   ├── PaymentStatus.tsx
│   │       │   └── RefundRequest.tsx
│   │       ├── pages/
│   │       │   ├── PaymentPage.tsx
│   │       │   └── PaymentSuccessPage.tsx
│   │       ├── hooks/
│   │       │   ├── usePayment.ts
│   │       │   └── useStripe.ts
│   │       ├── services/
│   │       │   └── paymentService.ts
│   │       └── types/
│   │           └── payment.types.ts
│   │
│   ├── shared/                      # 🔧 Composants partagés
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   ├── useApi.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useLocalStorage.ts
│   │   └── utils/
│   │       ├── api.ts (axios config)
│   │       ├── formatters.ts
│   │       └── validators.ts
│   │
│   ├── routes/                      # 📍 Configuration routes
│   │   └── index.tsx
│   │
│   ├── store/                       # 🗄️ State management global
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   └── index.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
└── package.json
```

---

## 🗺️ Routes Frontend (React Router)

### **15 Routes Principales**

```typescript
// routes/index.tsx

const routes = [
  // PUBLIC ROUTES
  {
    path: '/',
    element: <HomePage />,                    // Landing page
  },
  {
    path: '/shop',
    element: <ShopPage />,                    // Liste produits + filtres
  },
  {
    path: '/shop/:id',
    element: <ProductPage />,                 // Détail produit
  },
  {
    path: '/category/:category',
    element: <CategoryPage />,                // Produits par catégorie
  },
  {
    path: '/login',
    element: <LoginPage />,                   // Connexion
  },
  {
    path: '/register',
    element: <RegisterPage />,                // Inscription
  },
  
  // PROTECTED ROUTES (Auth Required)
  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
  },
  {
    path: '/settings',
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
  },
  {
    path: '/cart',
    element: <CartPage />,                    // Panier (peut être public)
  },
  {
    path: '/checkout',
    element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
  },
  {
    path: '/orders',
    element: <ProtectedRoute><OrdersPage /></ProtectedRoute>,
  },
  {
    path: '/orders/:id',
    element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute>,
  },
  {
    path: '/payment',
    element: <ProtectedRoute><PaymentPage /></ProtectedRoute>,
  },
  {
    path: '/payment/success',
    element: <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
```

---

## 📊 Mapping Backend ↔ Frontend

### **AUTH Module**

| Page Frontend | Route | Endpoints Backend Utilisés |
|---------------|-------|---------------------------|
| **LoginPage** | `/login` | `POST /api/auth/users/login/` |
| **RegisterPage** | `/register` | `POST /api/auth/users/register/` |
| **ProfilePage** | `/profile` | `GET /api/auth/users/me/`<br>`GET /api/auth/profiles/my_profile/` |
| **SettingsPage** | `/settings` | `PUT /api/auth/users/update_profile/`<br>`POST /api/auth/users/change_password/`<br>`DELETE /api/auth/users/delete_account/` |
| **Header (Logout)** | - | `POST /api/auth/users/logout/` |

---

### **SHOP Module**

| Page Frontend | Route | Endpoints Backend Utilisés |
|---------------|-------|---------------------------|
| **HomePage** | `/` | `GET /api/shop/products/` (featured) |
| **ShopPage** | `/shop` | `GET /api/shop/products/`<br>`GET /api/shop/products/?search=...`<br>Filtres: `?gender=...&master_category=...` |
| **ProductPage** | `/shop/:id` | `GET /api/shop/products/{id}/` |
| **CategoryPage** | `/category/:cat` | `GET /api/shop/products/?master_category=...` |

---

### **CART Module**

| Page Frontend | Route | Endpoints Backend Utilisés |
|---------------|-------|---------------------------|
| **CartPage** | `/cart` | ❌ Aucun (state local)<br>Produits: `GET /api/shop/products/{id}/` |
| **CartDrawer** | - | ❌ Aucun (state local) |

> **Note:** Le panier peut être géré en local (localStorage + Zustand) sans backend jusqu'au checkout.

---

### **ORDERS Module**

| Page Frontend | Route | Endpoints Backend Utilisés |
|---------------|-------|---------------------------|
| **CheckoutPage** | `/checkout` | `POST /api/orders/orders/` (créer commande)<br>`GET /api/shop/products/{id}/` (vérifier prix) |
| **OrdersPage** | `/orders` | `GET /api/orders/orders/my_orders/` |
| **OrderDetailPage** | `/orders/:id` | `GET /api/orders/orders/{id}/`<br>`POST /api/orders/orders/{id}/cancel_order/`<br>`POST /api/orders/orders/{id}/confirm_delivery/` |

---

### **PAYMENTS Module**

| Page Frontend | Route | Endpoints Backend Utilisés |
|---------------|-------|---------------------------|
| **PaymentPage** | `/payment` | `POST /api/payments/payments/create_payment_intent/`<br>`GET /api/payments/payments/{id}/status/` |
| **PaymentSuccessPage** | `/payment/success` | `GET /api/payments/payments/{id}/confirm/` |
| **OrderDetailPage** (refund) | `/orders/:id` | `POST /api/payments/refunds/create_refund/` |

---

## 🛠️ Technologies Recommandées

### **Core**
- ⚛️ **React 18+** avec TypeScript
- 🎨 **Vite** (déjà installé)
- 🧭 **React Router v6** pour le routing

### **State Management**
- 🐻 **Zustand** (léger) OU **Redux Toolkit** (complet)
- 🔄 **React Query / TanStack Query** pour les appels API (cache, mutations)

### **UI/UX**
- 🎨 **Tailwind CSS** (styling utility-first)
- 📦 **shadcn/ui** (composants réutilisables)
- 🎭 **Framer Motion** (animations)

### **Forms & Validation**
- 📝 **React Hook Form** (gestion formulaires)
- ✅ **Zod** (validation schemas)

### **HTTP Client**
- 🌐 **Axios** (requêtes HTTP avec intercepteurs)

### **Payments**
- 💳 **@stripe/stripe-js** + **@stripe/react-stripe-js**

---

## 📦 Installation des Dépendances

```bash
cd frontend

# Core routing & state
npm install react-router-dom
npm install zustand
npm install @tanstack/react-query

# UI Framework
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# HTTP Client
npm install axios

# Stripe
npm install @stripe/stripe-js @stripe/react-stripe-js

# UI Components (optional)
npm install lucide-react clsx tailwind-merge
```

---

## 🚀 Ordre de Développement Recommandé

### **Phase 1: Foundation (1-2 jours)**
1. ✅ Setup Tailwind CSS
2. ✅ Configuration Axios + API client
3. ✅ Configuration React Router
4. ✅ Configuration React Query
5. ✅ Composants UI de base (Button, Input, Card, etc.)
6. ✅ Layout (Header, Footer, MainLayout)

### **Phase 2: Auth Module (2-3 jours)**
7. ✅ Login/Register pages
8. ✅ Auth context/store
9. ✅ Protected routes
10. ✅ Profile & Settings pages

### **Phase 3: Shop Module (3-4 jours)**
11. ✅ Liste produits avec filtres
12. ✅ Recherche produits
13. ✅ Détail produit
14. ✅ Pagination

### **Phase 4: Cart Module (1-2 jours)**
15. ✅ Gestion panier (Zustand)
16. ✅ Cart page & drawer
17. ✅ localStorage persistence

### **Phase 5: Orders Module (2-3 jours)**
18. ✅ Checkout flow
19. ✅ Order creation
20. ✅ Orders list & details
21. ✅ Order status tracking

### **Phase 6: Payments Module (2-3 jours)**
22. ✅ Stripe integration
23. ✅ Payment form
24. ✅ Payment confirmation
25. ✅ Refund requests

### **Phase 7: Polish (1-2 jours)**
26. ✅ Loading states
27. ✅ Error handling
28. ✅ Animations
29. ✅ Responsive design
30. ✅ Testing

---

## 📊 Résumé Architecture

```
Frontend Architecture:
├── 15 Routes
├── 5 Feature Modules
│   ├── auth (4 pages)
│   ├── shop (4 pages)
│   ├── cart (1 page)
│   ├── orders (3 pages)
│   └── payments (2 pages)
├── 29 Endpoints Backend
└── ~30 Composants principaux
```

**Estimation totale: 12-17 jours de développement**

---

## 🎯 Prochaines Étapes

1. **Créer la structure de dossiers**
2. **Installer les dépendances**
3. **Configurer Tailwind CSS**
4. **Setup Axios + API client**
5. **Créer les types TypeScript**
6. **Commencer par le module Auth**

---

**Voulez-vous que je génère le code de démarrage pour un module spécifique ?**
