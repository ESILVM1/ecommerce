import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useSalesStats, useProductPerformance, useUserActivity } from '../hooks/useAnalytics';
import SalesStatsGrid from '../components/SalesStatsGrid';
import ProductPerformanceGrid from '../components/ProductPerformanceGrid';
import UserActivityGrid from '../components/UserActivityGrid';
import { formatPrice } from '../../../lib/utils';

export default function AnalyticsDashboardPage() {
  const { data: salesData, isLoading: salesLoading } = useSalesStats();
  const { data: productData, isLoading: productLoading } = useProductPerformance();
  const { data: userData, isLoading: userLoading } = useUserActivity();

  const isLoading = salesLoading || productLoading || userLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de Bord Analytics</h1>
        <p className="text-gray-600">Vue d'ensemble des performances de votre boutique</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
                <p className="text-2xl font-bold">{formatPrice(salesData?.total_revenue || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commandes</p>
                <p className="text-2xl font-bold">{salesData?.total_orders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{userData?.total_users || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Produits</p>
                <p className="text-2xl font-bold">{productData?.total_products || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Panier Moyen</p>
            <p className="text-xl font-bold">{formatPrice(salesData?.average_order_value || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Taux de Conversion</p>
            <p className="text-xl font-bold">{userData?.conversion_rate.toFixed(2) || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Utilisateurs Actifs</p>
            <p className="text-xl font-bold">{userData?.active_users || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Stats Grid */}
      {salesData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesStatsGrid data={salesData} />
          </CardContent>
        </Card>
      )}

      {/* Product Performance Grid */}
      {productData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Produits les Plus Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductPerformanceGrid data={productData} />
          </CardContent>
        </Card>
      )}

      {/* User Activity Grid */}
      {userData && (
        <Card>
          <CardHeader>
            <CardTitle>Inscriptions par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivityGrid data={userData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
