# Media Files Directory

Ce dossier contient tous les fichiers médias uploadés par les utilisateurs.

## Structure

```
media/
└── products/
    └── images/
        ├── .gitkeep
        └── [product images]
```

## Images de Produits

### Configuration
- **Format supportés**: JPEG, PNG, WebP
- **Taille maximale**: 5MB
- **Dimensions recommandées**: 800x800px (carré)

### Upload d'Images

Les images peuvent être uploadées via:
1. **Admin Panel Frontend** (`/admin/products`)
   - Créer ou éditer un produit
   - Utiliser le composant drag-drop
   - L'image sera automatiquement uploadée

2. **Django Admin** (`/admin`)
   - Accès administrateur Django
   - Gestion directe des produits

### Images Manquantes

Les produits sans images sont gérés gracieusement:
- Un placeholder gris est affiché
- Aucune erreur n'est générée
- Les URLs d'images manquantes retournent 404 (normal)

### Développement Local

Pour ajouter des images de test:

```bash
# Copier des images dans le dossier
cp /path/to/images/* backend/media/products/images/

# Ou créer des images via API
curl -X POST http://localhost:8000/api/shop/products/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "product_display_name=Test Product" \
  -F "price=29.99" \
  -F "image=@/path/to/image.jpg"
```

### Production

**Important**: En production, servez les médias via:
- Un CDN (CloudFlare, AWS CloudFront)
- Un stockage object (AWS S3, Google Cloud Storage)
- Un serveur web dédié (Nginx, Apache)

Ne servez **jamais** les médias directement via Django en production!

### Backup

```bash
# Sauvegarder les médias
tar -czf media-backup-$(date +%Y%m%d).tar.gz backend/media/

# Restaurer les médias
tar -xzf media-backup-YYYYMMDD.tar.gz
```

### .gitignore

Les fichiers médias uploadés ne sont **pas** versionnés dans git.
Seule la structure de dossiers (via .gitkeep) est trackée.

## Support

Pour questions sur la gestion des médias, voir:
- Django documentation: https://docs.djangoproject.com/en/stable/topics/files/
- Settings: `backend/ecommerce/settings.py` (MEDIA_ROOT, MEDIA_URL)
- URLs: `backend/ecommerce/urls.py` (static files serving)
