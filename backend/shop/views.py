from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed or edited.
    Implements caching for list and retrieve operations.
    Cache is invalidated on create, update, and delete operations.
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    # Enable filtering and search
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'master_category', 'sub_category', 'season', 'usage']
    search_fields = ['product_display_name', 'article_type', 'base_colour']
    ordering_fields = ['price', 'created_at', 'year']
    
    def get_queryset(self):
        """
        Get queryset with random ordering if no filters are applied.
        """
        queryset = super().get_queryset()
        
        # Check if any filters or search are applied
        has_filters = any([
            self.request.query_params.get('gender'),
            self.request.query_params.get('master_category'),
            self.request.query_params.get('sub_category'),
            self.request.query_params.get('season'),
            self.request.query_params.get('usage'),
            self.request.query_params.get('search'),
            self.request.query_params.get('ordering'),
        ])
        
        # If no filters are applied, randomize the order
        if not has_filters and self.action == 'list':
            return queryset.order_by('?')
        
        return queryset
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @method_decorator(vary_on_headers('Authorization'))
    def list(self, request, *args, **kwargs):
        """
        List all products with caching.
        Cache varies based on query parameters and authorization.
        """
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single product with caching.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        """Clear cache when creating a new product."""
        super().perform_create(serializer)
        self._clear_product_cache()
    
    def perform_update(self, serializer):
        """Clear cache when updating a product."""
        super().perform_update(serializer)
        self._clear_product_cache()
    
    def perform_destroy(self, instance):
        """Clear cache when deleting a product."""
        super().perform_destroy(instance)
        self._clear_product_cache()
    
    def _clear_product_cache(self):
        """Helper method to clear all product-related caches."""
        cache.delete_pattern('*product*')
        cache.delete_pattern('*shop*')