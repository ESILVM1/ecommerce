import csv
import os
from django.core.files import File
from django.core.management.base import BaseCommand
from core.models import Product
from django.conf import settings


class Command(BaseCommand):
    help = "Importe les produits depuis le fichier CSV"

    def handle(self, *args, **options):
        csv_path = os.path.join(settings.MEDIA_ROOT, "products", "styles.csv")
        images_dir = os.path.join(settings.MEDIA_ROOT, "products", "images")

        if not os.path.exists(csv_path):
            self.stdout.write(
                self.style.ERROR(f"Fichier CSV non trouvé: {csv_path}")
            )
            return

        with open(csv_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                product = Product(
                    product_id=row["id"],
                    gender=row["gender"],
                    master_category=row["masterCategory"],
                    sub_category=row["subCategory"],
                    article_type=row["articleType"],
                    base_colour=row["baseColour"],
                    season=row["season"],
                    year=int(row["year"]) if row["year"] else None,
                    usage=row["usage"],
                    product_display_name=row["productDisplayName"],
                )

                # nom de l'image basée sur l'id
                image_name = f"{row['id']}.jpg"
                image_path = os.path.join(images_dir, image_name)

                if os.path.exists(image_path):
                    with open(image_path, "rb") as f:
                        product.image.save(image_name, File(f), save=False)
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠ Image manquante pour le produit {row['id']}"
                        )
                    )

                product.save()
                self.stdout.write(
                    f"Produit importé: {product.product_display_name}"
                )
