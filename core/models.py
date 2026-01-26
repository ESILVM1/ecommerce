from django.db import models

class TimeStampedModel(models.Model):
    """
    Une classe abstraite qui ajoute automatiquement les champs
    created_at et updated_at à tous les modèles qui en héritent.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

from django.db import models
from core.models import TimeStampedModel

class Product(TimeStampedModel):
    product_id = models.IntegerField(unique=True)
    gender = models.CharField(max_length=50)
    master_category = models.CharField(max_length=50)
    sub_category = models.CharField(max_length=50)
    article_type = models.CharField(max_length=50)
    base_colour = models.CharField(max_length=50)
    season = models.CharField(max_length=50)
    year = models.IntegerField()
    usage = models.CharField(max_length=50)
    product_display_name = models.CharField(max_length=200)
    image = models.ImageField(upload_to="products/images/")


    def __str__(self):
        return self.name
