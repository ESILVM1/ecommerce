# 🛍️ E-Commerce Platform

Application e-commerce complète avec backend Django et frontend React TypeScript.

## Table des matières

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Démarrage rapide](#démarrage-rapide)
- [CI/CD](#cicd)
- [Tests](#tests)
- [Documentation](#documentation)

## Architecture

```
ecommerce/
├── backend/           # API Django REST Framework
│   ├── users/        # Gestion des utilisateurs
│   ├── shop/         # Catalogue produits
│   ├── orders/       # Gestion des commandes
│   ├── payments/     # Intégration Stripe
│   └── core/         # Fonctionnalités de base
├── frontend/          # Application React TypeScript
│   └── src/
│       ├── features/ # Modules par fonctionnalité
│       ├── components/ # Composants réutilisables
│       └── lib/      # Utilitaires
└── .github/
    └── workflows/    # CI/CD GitHub Actions
```

## Technologies

### Backend
- **Django 6.0.1** - Framework web Python
- **Django REST Framework** - API REST
- **PostgreSQL 16** - Base de données
- **Stripe** - Paiements en ligne
- **pytest** - Framework de tests

### Frontend
- **React 18** - Library UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Zustand** - State management
- **TailwindCSS** - Styling

### DevOps
- **Docker & Docker Compose** - Containerisation
- **GitHub Actions** - CI/CD
- **pytest, Black, Flake8** - Quality tools

## Démarrage rapide

### Prérequis

- Docker & Docker Compose

```bash
# Cloner le repository
git clone <repo-url>
cd ecommerce

# Lancer tous les services
docker-compose up -d

# Accéder aux services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Django: http://localhost:8000/admin
# Database UI: http://localhost:8080
```

### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Accéder au shell Django
docker-compose exec web python manage.py shell

# Exécuter les migrations
docker-compose exec web python manage.py migrate

# Créer un superuser
docker-compose exec web python manage.py createsuperuser

# Lancer les tests
docker-compose exec web python manage.py test

# Arrêter les services
docker-compose down
```

## CI/CD

Ce projet utilise **GitHub Actions** pour l'intégration continue.

### Workflows disponibles

#### Backend Tests
-  Tests automatiques avec pytest
-  Vérification de la couverture de code
-  Linting (Black, isort, Flake8)
-  PostgreSQL 16 en service

**Déclenché sur:**
- Push vers `main` ou `develop`
- Pull requests vers `main` ou `develop`
- Uniquement si fichiers `backend/**` modifiés

### Configuration

Fichiers de configuration :
- `.github/workflows/backend-tests.yml` - Workflow backend
- `backend/pytest.ini` - Configuration pytest
- `backend/.flake8` - Configuration Flake8
- `backend/pyproject.toml` - Black, isort, coverage

### Badges

![Backend Tests](https://github.com/VOTRE_ORG/VOTRE_REPO/workflows/Backend%20Tests/badge.svg)

##  Tests

### Backend

```bash
cd backend

# Installer les dépendances de test
pip install pytest pytest-django pytest-cov

# Exécuter tous les tests
pytest

# Avec couverture
pytest --cov=. --cov-report=html

# Ouvrir le rapport
open htmlcov/index.html  # macOS
```

### Qualité du code

```bash
# Formater le code
black .

# Trier les imports
isort .

# Linting
flake8 .
```

### Apps testées

- `users` - Authentification, profils, permissions
- `shop` - Produits, filtres, recherche
- `orders` - Commandes, workflow
- `payments` - Stripe, webhooks
- `core` - Fonctionnalités de base

## Documentation

### Backend

- [API Documentation](http://localhost:8000/swagger/) - Swagger UI
- [ReDoc](http://localhost:8000/redoc/) - Documentation alternative
- [Django Admin](http://localhost:8000/admin/) - Interface d'administration

### Structure du code

```
backend/
├── users/
│   ├── models.py       # CustomUser, UserProfile
│   ├── serializers.py  # API serializers
│   ├── views.py        # API endpoints
│   ├── services.py     # Business logic
│   └── tests.py        # Tests
├── shop/
│   ├── models.py       # Product
│   ├── views.py        # Product API
│   └── management/     # Commands (import_products)
├── orders/
│   ├── models.py       # Order, OrderItem
│   └── services.py     # Order logic
└── payments/
    ├── models.py       # Payment
    └── services.py     # Stripe integration
```

## Variables d'environnement

### Backend (.env)

```env
# Database
DATABASE_NAME=ecommerce
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=db
DATABASE_PORT=5432

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Scripts utiles

### Backend

```bash
# Créer des migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Importer des produits
python manage.py import_products data/styles.csv

# Créer un superuser
python manage.py createsuperuser

# Shell Django
python manage.py shell
```

### Frontend

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

## Docker

### Services

```yaml
services:
  db:          # PostgreSQL 16
  backend:     # Django API (port 8000)
  frontend:    # React App (port 3000)
```

### Commandes Docker

```bash
# Construire les images
docker-compose build

# Lancer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Exécuter des commandes
docker-compose exec backend python manage.py migrate
docker-compose exec backend pytest

# Arrêter les services
docker-compose down

# Supprimer tout (y compris volumes)
docker-compose down -v
```

## Contribution

### Workflow Git

1. **Créer une branche**
   ```bash
   git checkout -b feat/ma-fonctionnalite
   ```

2. **Faire des commits**
   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalité"
   ```

3. **Pousser la branche**
   ```bash
   git push origin feat/ma-fonctionnalite
   ```

4. **Créer une Pull Request**
   - GitHub Actions exécutera automatiquement les tests
   - Attendre que tous les tests passent 
   - Demander une code review

5. **Merger après approbation**

### Conventions de commits

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, points-virgules manquants, etc.
- `refactor:` Refactoring du code
- `test:` Ajout de tests
- `chore:` Tâches de maintenance

### Checklist avant PR

- [ ] Les tests passent localement (`pytest`)
- [ ] Le code est formaté (`black .` et `isort .`)
- [ ] Pas d'erreurs de linting (`flake8 .`)
- [ ] La couverture de code est maintenue
- [ ] Les nouvelles fonctionnalités ont des tests
- [ ] La documentation est à jour

## Équipe

Projet développé dans le cadre du M1 Web Architecture à ESILV.

# Ahmat ROUCHAD
# Chanez KHELIFA

---

**Dernière mise à jour:** 31 janvier 2026
