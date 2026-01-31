import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductFiltersComponent from '../components/ProductFilters';
import type { ProductFilters } from '../types/product.types';

export default function ShopPage() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data, isLoading, error } = useProducts(filters);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Erreur lors du chargement des produits
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Boutique</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFiltersComponent
            onFilterChange={setFilters}
            activeFilters={filters}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : data?.results && data.results.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {data.count} produit{data.count > 1 ? 's' : ''} trouvé{data.count > 1 ? 's' : ''}
                </p>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Trier par: Récent</option>
                  <option>Prix: Croissant</option>
                  <option>Prix: Décroissant</option>
                  <option>Nom: A-Z</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination placeholder */}
              {data.count > 20 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                    Précédent
                  </button>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-md">
                    1
                  </button>
                  <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
              <button
                onClick={() => setFilters({})}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
