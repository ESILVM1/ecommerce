from rest_framework import viewsets, permissions
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed or edited.
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    
   
    filterset_fields = ['gender', 'master_category', 'sub_category']
    search_fields = ['product_display_name', 'article_type']