from django.db import models

class TimeStampedModel(models.Model):
    """
    Une classe abstraite qui ajoute automatiquement les champs
    created_at et updated_at à tous les modèles qui en héritent.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
