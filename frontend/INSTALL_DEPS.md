# Installation des Dépendances (100% Docker)

## 🐳 Les dépendances sont déjà dans package.json

Pour installer les nouvelles dépendances dans Docker:

```bash
# Option 1: Rebuild le container
docker-compose up --build frontend

# Option 2: Installer dans le container en cours
docker-compose exec frontend npm install

# Option 3: Arrêter et rebuild
docker-compose down
docker-compose up --build
```

## 📦 Dépendances ajoutées

### Production
- react-router-dom (routing)
- axios (HTTP client)
- @tanstack/react-query (API state)
- zustand (state management)
- react-hook-form (forms)
- zod (validation)
- @hookform/resolvers (form validation)
- @stripe/stripe-js + @stripe/react-stripe-js (payments)
- clsx (classnames)
- lucide-react (icons)

### Dev
- tailwindcss
- autoprefixer
- postcss

Toutes les dépendances seront installées automatiquement au build Docker !
