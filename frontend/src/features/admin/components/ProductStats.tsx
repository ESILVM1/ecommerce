import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface Product {
  id: number;
  product_display_name: string;
  price: number | string;
  gender: string;
  master_category: string;
  season: string;
  created_at: string;
}

interface ProductStatsProps {
  products: Product[];
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export default function ProductStats({ products }: ProductStatsProps) {
  const stats = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        total: 0,
        avgPrice: 0,
        recentCount: 0,
        byGender: [],
        byCategory: [],
        bySeason: [],
      };
    }

    // Total products
    const total = products.length;

    // Average price
    const avgPrice = products.reduce((sum, p) => sum + Number(p.price), 0) / total;

    // Recent additions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = products.filter(p => {
      const createdDate = new Date(p.created_at);
      return createdDate >= sevenDaysAgo;
    }).length;

    // By gender
    const genderCounts: Record<string, number> = {};
    products.forEach(p => {
      genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
    });
    const byGender = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // By category (top 6)
    const categoryCounts: Record<string, number> = {};
    products.forEach(p => {
      categoryCounts[p.master_category] = (categoryCounts[p.master_category] || 0) + 1;
    });
    const byCategory = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // By season
    const seasonCounts: Record<string, number> = {};
    products.forEach(p => {
      seasonCounts[p.season] = (seasonCounts[p.season] || 0) + 1;
    });
    const bySeason = Object.entries(seasonCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      total,
      avgPrice,
      recentCount,
      byGender,
      byCategory,
      bySeason,
    };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Package className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                €{stats.avgPrice.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Additions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.recentCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.byCategory.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Unique</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Gender (Pie Chart) */}
        {stats.byGender.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Products by Gender
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.byGender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.byGender.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Products by Season (Bar Chart) */}
        {stats.bySeason.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Products by Season
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.bySeason}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Categories (Bar Chart) */}
        {stats.byCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Categories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
