import csv
import random
import os
from django.core.management.base import BaseCommand
from shop.models import Product

class Command(BaseCommand):
    help = 'Import products from styles.csv'

    def add_arguments(self, parser):
        # C'est cette ligne qui permet d'accepter le fichier CSV
        parser.add_argument('csv_file', type=str, help='The path to the CSV file')

    def handle(self, *args, **kwargs):
        csv_file_path = kwargs['csv_file']
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'Fichier introuvable : {csv_file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Début de l\'import depuis {csv_file_path}...'))

        products_to_create = []
        
        with open(csv_file_path, 'r', encoding='utf-8', errors='ignore') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                try:
                    product_id = int(row['id'])
                    
                    if Product.objects.filter(id=product_id).exists():
                        continue

                    # Gestion de l'année
                    try:
                        year = int(float(row['year']))
                    except (ValueError, TypeError):
                        year = 2000

                    # --- GESTION DES IMAGES ---
                    # Tes images sont dans media/products/images/ID.jpg
                    # Django stocke le chemin relatif à partir de "media/"
                    image_path = f"products/images/{product_id}.jpg"
                    
                    product = Product(
                        id=product_id,
                        gender=row['gender'],
                        master_category=row['masterCategory'],
                        sub_category=row['subCategory'],
                        article_type=row['articleType'],
                        base_colour=row['baseColour'],
                        season=row['season'],
                        year=year,
                        usage=row['usage'],
                        product_display_name=row['productDisplayName'],
                        price=round(random.uniform(10.0, 100.0), 2),
                        description=row['productDisplayName'],
                        image=image_path  # On sauvegarde le bon chemin
                    )
                    products_to_create.append(product)

                    if len(products_to_create) >= 1000:
                        Product.objects.bulk_create(products_to_create)
                        self.stdout.write(self.style.SUCCESS('1000 produits insérés...'))
                        products_to_create = []

                except Exception as e:
                    pass # On ignore les erreurs silencieusement

            if products_to_create:
                Product.objects.bulk_create(products_to_create)

        self.stdout.write(self.style.SUCCESS('Importation terminée avec succès !'))