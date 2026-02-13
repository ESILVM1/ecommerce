import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { GENDER_OPTIONS, SEASON_OPTIONS, USAGE_OPTIONS } from '../schemas/productSchema';

export interface FilterOptions {
  genders: string[];
  seasons: string[];
  usages: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  maxYear: number | null;
  masterCategory: string;
  subCategory: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onClear: () => void;
}

export default function AdvancedFilters({ filters, onChange, onClear }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMultiSelectChange = (
    field: 'genders' | 'seasons' | 'usages',
    value: string
  ) => {
    const currentValues = filters[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    
    onChange({ ...filters, [field]: newValues });
  };

  const handleInputChange = (field: keyof FilterOptions, value: any) => {
    onChange({ ...filters, [field]: value });
  };

  const activeFilterCount = 
    filters.genders.length +
    filters.seasons.length +
    filters.usages.length +
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.minYear !== null ? 1 : 0) +
    (filters.maxYear !== null ? 1 : 0) +
    (filters.masterCategory ? 1 : 0) +
    (filters.subCategory ? 1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={20} />
        Advanced Filters
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-96 z-50 max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Advanced Filters
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="space-y-2">
                  {GENDER_OPTIONS.map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.genders.includes(gender)}
                        onChange={() => handleMultiSelectChange('genders', gender)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Season Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Season
                </label>
                <div className="space-y-2">
                  {SEASON_OPTIONS.map((season) => (
                    <label key={season} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.seasons.includes(season)}
                        onChange={() => handleMultiSelectChange('seasons', season)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{season}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Usage Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage
                </label>
                <div className="space-y-2">
                  {USAGE_OPTIONS.map((usage) => (
                    <label key={usage} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.usages.includes(usage)}
                        onChange={() => handleMultiSelectChange('usages', usage)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{usage}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (€)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice ?? ''}
                    onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice ?? ''}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.minYear ?? ''}
                    onChange={(e) => handleInputChange('minYear', e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.maxYear ?? ''}
                    onChange={(e) => handleInputChange('maxYear', e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Master Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Apparel"
                  value={filters.masterCategory}
                  onChange={(e) => handleInputChange('masterCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Topwear"
                  value={filters.subCategory}
                  onChange={(e) => handleInputChange('subCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
