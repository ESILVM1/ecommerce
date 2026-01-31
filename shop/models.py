from django.db import models

class Product(models.Model):
   
    GENDER_CHOICES = [
        ('Men', 'Men'),
        ('Women', 'Women'),  
        ('Boys', 'Boys'),
        ('Girls', 'Girls'), 
        ('Unisex', 'Unisex'),
    ]

    SEASON_CHOICES = [
        ('Spring', 'Spring'),
        ('Summer', 'Summer'),
        ('Fall', 'Fall'),
        ('Winter', 'Winter'),
    ]

    USAGE_CHOICES = [
        ('Casual', 'Casual'),
        ('Smart Casual', 'Smart Casual'),
        ('Formal', 'Formal'),
        ('Party', 'Party'),
        ('Sports', 'Sports'),
        ('Travel', 'Travel'),
    ]
     

    id = models.PositiveIntegerField(primary_key=True) 
    
    product_display_name = models.CharField(max_length=255, verbose_name="Display Name")
    
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES)

    # Catégorie
    master_category = models.CharField(max_length=100, db_index=True)
    sub_category = models.CharField(max_length=100, db_index=True)
    article_type = models.CharField(max_length=100, db_index=True)

    base_colour = models.CharField(max_length=50)
    season = models.CharField(max_length=20, choices=SEASON_CHOICES)
    year = models.PositiveIntegerField()
    usage = models.CharField(max_length=50, choices=USAGE_CHOICES)
    
    # Champs E-commerce
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    description = models.TextField(blank=True, null=True)    
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product'      
        verbose_name_plural = 'Products'

    def __str__(self):
        return f"{self.product_display_name} ({self.id})"