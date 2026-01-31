# GitHub Actions Workflows

Ce dossier contient les workflows GitHub Actions pour l'automatisation des tests et de l'intégration continue.

## 📋 Workflows Disponibles

### Backend Tests (`backend-tests.yml`)

Exécute automatiquement les tests du backend Django à chaque push ou pull request.

**Déclencheurs:**
- Push vers les branches `main` et `develop`
- Pull requests vers les branches `main` et `develop`
- Uniquement si des fichiers dans `backend/` sont modifiés

**Jobs:**

1. **Test** - Exécution des tests Django
   - Configure PostgreSQL 16
   - Installe les dépendances Python
   - Exécute les migrations Django
   - Lance les tests avec pytest et génère un rapport de couverture
   - Upload la couverture vers Codecov (optionnel)

2. **Lint** - Vérifications de qualité du code
   - Black: Vérifie le formatage du code
   - isort: Vérifie le tri des imports
   - Flake8: Linting et vérification des erreurs

**Variables d'environnement requises:**
- `DATABASE_NAME`: Nom de la base de données de test
- `DATABASE_USER`: Utilisateur PostgreSQL
- `DATABASE_PASSWORD`: Mot de passe PostgreSQL
- `DATABASE_HOST`: Hôte de la base de données
- `DATABASE_PORT`: Port PostgreSQL
- `STRIPE_PUBLIC_KEY`: Clé publique Stripe (dummy pour les tests)
- `STRIPE_SECRET_KEY`: Clé secrète Stripe (dummy pour les tests)
- `STRIPE_WEBHOOK_SECRET`: Secret webhook Stripe (dummy pour les tests)

## 🚀 Utilisation Locale

### Exécuter les tests localement

```bash
cd backend
pip install pytest pytest-django pytest-cov
pytest --cov=. --cov-report=html
```

### Vérifier le formatage du code

```bash
cd backend
pip install black isort flake8

# Vérifier le formatage
black --check .

# Appliquer le formatage
black .

# Vérifier les imports
isort --check-only .

# Corriger les imports
isort .

# Linting
flake8 .
```

## 📊 Badges de Statut

Ajoutez ces badges à votre README principal:

```markdown
![Backend Tests](https://github.com/VOTRE_USERNAME/VOTRE_REPO/workflows/Backend%20Tests/badge.svg)
```

## 🔧 Configuration

Les fichiers de configuration se trouvent dans `backend/`:
- `pytest.ini`: Configuration de pytest
- `.flake8`: Configuration de Flake8
- `pyproject.toml`: Configuration de Black, isort et coverage

## 📝 Bonnes Pratiques

1. **Toujours créer une pull request** plutôt que de push directement sur `main`
2. **Attendre que tous les tests passent** avant de merger
3. **Vérifier la couverture de code** pour s'assurer que les nouvelles fonctionnalités sont testées
4. **Résoudre les warnings de linting** pour maintenir la qualité du code

## 🐛 Dépannage

### Les tests échouent localement mais pas en CI
- Vérifiez que vous utilisez la même version de Python (3.11)
- Assurez-vous que PostgreSQL est en cours d'exécution
- Vérifiez les variables d'environnement

### Erreur de connexion à la base de données
- Le workflow attend que PostgreSQL soit prêt avec `pg_isready`
- Vérifiez que le service PostgreSQL est correctement configuré dans le workflow

### Erreur de migration
- Le workflow vérifie que toutes les migrations sont à jour avec `makemigrations --check`
- Si des migrations sont manquantes, créez-les localement et committez-les
