import { useState } from 'react';
import { Trash2, Edit, X } from 'lucide-react';
import { SEASON_OPTIONS, USAGE_OPTIONS } from '../schemas/productSchema';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkUpdate: (updates: Record<string, any>) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export default function BulkActionsToolbar({
  selectedCount,
  onBulkDelete,
  onBulkUpdate,
  onClearSelection,
  isLoading = false,
}: BulkActionsToolbarProps) {
  const [showUpdateMenu, setShowUpdateMenu] = useState(false);
  const [updateField, setUpdateField] = useState<'season' | 'usage' | 'price' | null>(null);
  const [updateValue, setUpdateValue] = useState<string>('');

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} product(s)?`)) {
      onBulkDelete();
    }
  };

  const handleBulkUpdate = () => {
    if (!updateField || !updateValue) {
      return;
    }

    let updates: Record<string, any> = {};
    
    if (updateField === 'price') {
      // Handle price updates (percentage change)
      const percentage = parseFloat(updateValue);
      if (isNaN(percentage)) {
        alert('Please enter a valid percentage');
        return;
      }
      // Note: This would need backend support to calculate new prices
      alert('Price updates require backend support for calculating percentages');
      return;
    } else {
      updates[updateField] = updateValue;
    }

    if (window.confirm(`Are you sure you want to update ${selectedCount} product(s)?`)) {
      onBulkUpdate(updates);
      setShowUpdateMenu(false);
      setUpdateField(null);
      setUpdateValue('');
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-semibold">
          {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkDelete}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Delete
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowUpdateMenu(!showUpdateMenu)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit size={16} />
              Update
            </button>
            
            {showUpdateMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white text-gray-900 rounded-lg shadow-xl p-4 w-80 z-10">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Field to update
                    </label>
                    <select
                      value={updateField || ''}
                      onChange={(e) => {
                        setUpdateField(e.target.value as any);
                        setUpdateValue('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Select field...</option>
                      <option value="season">Season</option>
                      <option value="usage">Usage</option>
                    </select>
                  </div>
                  
                  {updateField === 'season' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New season
                      </label>
                      <select
                        value={updateValue}
                        onChange={(e) => setUpdateValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select season...</option>
                        {SEASON_OPTIONS.map((season) => (
                          <option key={season} value={season}>
                            {season}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {updateField === 'usage' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New usage
                      </label>
                      <select
                        value={updateValue}
                        onChange={(e) => setUpdateValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select usage...</option>
                        {USAGE_OPTIONS.map((usage) => (
                          <option key={usage} value={usage}>
                            {usage}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowUpdateMenu(false);
                        setUpdateField(null);
                        setUpdateValue('');
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkUpdate}
                      disabled={!updateField || !updateValue}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={onClearSelection}
        disabled={isLoading}
        className="p-1 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X size={20} />
      </button>
    </div>
  );
}
