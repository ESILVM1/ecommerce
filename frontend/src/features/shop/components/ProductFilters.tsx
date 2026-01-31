import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { ProductFilters } from '../types/product.types';
import Button from '../../../components/ui/Button';

interface ProductFiltersProps {
  onFilterChange: (filters: ProductFilters) => void;
  activeFilters: ProductFilters;
}

export default function ProductFiltersComponent({ onFilterChange, activeFilters }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const genders = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  const usages = ['Casual', 'Smart Casual', 'Formal', 'Party', 'Sports', 'Travel'];

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    if (activeFilters[key] === value) {
      const { [key]: _, ...rest } = activeFilters;
      onFilterChange(rest);
    } else {
      onFilterChange({ ...activeFilters, [key]: value });
    }
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold">Filtres</h3>
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Effacer
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Gender */}
        <div>
          <h4 className="font-medium text-sm mb-3">Genre</h4>
          <div className="flex flex-wrap gap-2">
            {genders.map((gender) => (
              <button
                key={gender}
                onClick={() => handleFilterChange('gender', gender)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeFilters.gender === gender
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div>
          <h4 className="font-medium text-sm mb-3">Saison</h4>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => handleFilterChange('season', season)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeFilters.season === season
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        {/* Usage */}
        <div>
          <h4 className="font-medium text-sm mb-3">Usage</h4>
          <div className="flex flex-wrap gap-2">
            {usages.map((usage) => (
              <button
                key={usage}
                onClick={() => handleFilterChange('usage', usage)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeFilters.usage === usage
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {usage}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
