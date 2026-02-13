from django.urls import path
from .views import SalesStatsView, ProductPerformanceView, UserActivityView

urlpatterns = [
    path('sales-stats/', SalesStatsView.as_view(), name='sales-stats'),
    path('product-performance/', ProductPerformanceView.as_view(), name='product-performance'),
    path('user-activity/', UserActivityView.as_view(), name='user-activity'),
]
