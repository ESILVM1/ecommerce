import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { type ColDef, type GridReadyEvent, type GridApi } from 'ag-grid-community';
import { Plus, Search, Download, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { useProducts } from '../../shop/hooks/useProducts';
import { useAdminProducts, useProduct } from '../hooks/useAdminProducts';
import { Toaster } from 'sonner';
import Papa from 'papaparse';

// Components
import ProductFormModal from '../components/ProductFormModal';
import BulkActionsToolbar from '../components/BulkActionsToolbar';
import AdvancedFilters, { type FilterOptions } from '../components/AdvancedFilters';
import ProductStats from '../components/ProductStats';

// Types
import { type ProductFormData, convertToFormData } from '../schemas/productSchema';

// Import des styles AG Grid
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function ProductManagement() {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    genders: [],
    seasons: [],
    usages: [],
    minPrice: null,
    maxPrice: null,
    minYear: null,
    maxYear: null,
    masterCategory: '',
    subCategory: '',
  });
  
  const gridApiRef = useRef<GridApi | null>(null);

  // Hooks
  const { data, isLoading } = useProducts({ 
    search: debouncedSearch,
    gender: filters.genders.length > 0 ? filters.genders.join(',') : undefined,
    season: filters.seasons.length > 0 ? filters.seasons.join(',') : undefined,
    usage: filters.usages.length > 0 ? filters.usages.join(',') : undefined,
    master_category: filters.masterCategory || undefined,
    sub_category: filters.subCategory || undefined,
  });
  
  const {
    createProductAsync,
    updateProductAsync,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateProducts,
    isCreating,
    isUpdating,
  } = useAdminProducts();

  const { data: editingProduct } = useProduct(editingProductId);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter products client-side for additional filters
  const filteredProducts = useMemo(() => {
    let products = data?.results || [];

    // Apply price range filter
    if (filters.minPrice !== null) {
      products = products.filter(p => Number(p.price) >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      products = products.filter(p => Number(p.price) <= filters.maxPrice!);
    }

    // Apply year range filter
    if (filters.minYear !== null) {
      products = products.filter(p => p.year >= filters.minYear!);
    }
    if (filters.maxYear !== null) {
      products = products.filter(p => p.year <= filters.maxYear!);
    }

    return products;
  }, [data, filters]);

  // Handlers
  const handleCreateProduct = useCallback(() => {
    setEditingProductId(null);
    setIsModalOpen(true);
  }, []);

  const handleEditProduct = useCallback((productId: number) => {
    setEditingProductId(productId);
    setIsModalOpen(true);
  }, []);

  const handleDeleteProduct = useCallback((productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  }, [deleteProduct]);

  const handleModalSubmit = useCallback(async (formData: ProductFormData, imageFile: File | null) => {
    try {
      const submitData = convertToFormData(formData, imageFile);
      
      if (editingProductId) {
        await updateProductAsync({ id: editingProductId, data: submitData });
      } else {
        await createProductAsync(submitData);
      }
      
      setIsModalOpen(false);
      setEditingProductId(null);
    } catch (error) {
      console.error('Failed to submit product:', error);
    }
  }, [editingProductId, createProductAsync, updateProductAsync]);

  const handleBulkDelete = useCallback(() => {
    const ids = selectedRows.map(row => row.id);
    bulkDeleteProducts(ids);
    setSelectedRows([]);
    gridApiRef.current?.deselectAll();
  }, [selectedRows, bulkDeleteProducts]);

  const handleBulkUpdate = useCallback((updates: Record<string, any>) => {
    const ids = selectedRows.map(row => row.id);
    bulkUpdateProducts({ ids, updates });
    setSelectedRows([]);
    gridApiRef.current?.deselectAll();
  }, [selectedRows, bulkUpdateProducts]);

  const handleClearSelection = useCallback(() => {
    setSelectedRows([]);
    gridApiRef.current?.deselectAll();
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      genders: [],
      seasons: [],
      usages: [],
      minPrice: null,
      maxPrice: null,
      minYear: null,
      maxYear: null,
      masterCategory: '',
      subCategory: '',
    });
    setSearchTerm('');
  }, []);

  const handleExport = useCallback(() => {
    const exportData = filteredProducts.map(p => ({
      ID: p.id,
      Name: p.product_display_name,
      Price: p.price,
      Category: p.master_category,
      SubCategory: p.sub_category,
      ArticleType: p.article_type,
      Gender: p.gender,
      Season: p.season,
      Year: p.year,
      Usage: p.usage,
      Color: p.base_colour,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredProducts]);

  // Grid callbacks
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
    
    // Add event listeners for action buttons using event delegation on document
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle edit button
      if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
        const btn = target.classList.contains('edit-btn') ? target : target.closest('.edit-btn');
        const productId = btn?.getAttribute('data-id');
        if (productId) {
          handleEditProduct(Number(productId));
        }
      }
      
      // Handle delete button
      if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
        const btn = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn');
        const productId = btn?.getAttribute('data-id');
        if (productId) {
          handleDeleteProduct(Number(productId));
        }
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleEditProduct, handleDeleteProduct]);

  const onSelectionChanged = useCallback(() => {
    if (gridApiRef.current) {
      const selected = gridApiRef.current.getSelectedRows();
      setSelectedRows(selected);
    }
  }, []);

  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 90, 
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellStyle: { fontWeight: '600', color: '#0369a1' } as any
    },
    {
      headerName: 'Image',
      width: 80,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const imageUrl = params.data.image;
        if (!imageUrl) {
          return '<div style="width: 50px; height: 50px; background: #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">📷</div>';
        }
        return `<img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<div style=&quot;width: 50px; height: 50px; background: #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #9ca3af;&quot;>📷</div>\';" />`;
      }
    },
    { 
      field: 'product_display_name', 
      headerName: 'Product', 
      flex: 2, 
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' } as any
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 120, 
      valueFormatter: (p: any) => `€${p.value}`,
      cellStyle: { fontWeight: '700', color: '#16a34a', textAlign: 'right' } as any,
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'master_category', 
      headerName: 'Category', 
      width: 150,
      filter: true 
    },
    { 
      field: 'gender', 
      headerName: 'Gender', 
      width: 100,
      filter: true,
      cellStyle: (params: any) => ({
        backgroundColor: params.value === 'Men' ? '#dbeafe' : 
                         params.value === 'Women' ? '#fce7f3' : '#f3f4f6',
        fontWeight: '600',
        textAlign: 'center'
      }) as any
    },
    { 
      field: 'season', 
      headerName: 'Season', 
      width: 100,
      filter: true 
    },
    {
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        
        return `
          <div style="display: flex; align-items: center; height: 100%; gap: 8px; justify-content: center;">
            <button 
              class="edit-btn"
              data-id="${params.data.id}"
              style="padding: 6px 12px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500;"
              onmouseover="this.style.backgroundColor='#2563eb'"
              onmouseout="this.style.backgroundColor='#3b82f6'"
            >
              ✏️ Edit
            </button>
            <button 
              class="delete-btn"
              data-id="${params.data.id}"
              style="padding: 6px 12px; background-color: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500;"
              onmouseover="this.style.backgroundColor='#dc2626'"
              onmouseout="this.style.backgroundColor='#ef4444'"
            >
              🗑️ Delete
            </button>
          </div>
        `;
      }
    }
  ] as ColDef[], []);

  return (
    <div className="flex flex-col h-full space-y-4 p-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-500 mt-1">
            Manage your {filteredProducts.length.toLocaleString()} products in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showStats ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <Plus size={20} />
            New Product
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="animate-in slide-in-from-top">
          <ProductStats products={filteredProducts} />
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name, type, or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <AdvancedFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedRows.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedRows.length}
          onBulkDelete={handleBulkDelete}
          onBulkUpdate={handleBulkUpdate}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Data Grid */}
      <div className="ag-theme-alpine w-full flex-grow shadow-lg rounded-xl overflow-hidden border border-gray-200" style={{ height: '60vh' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package className="mb-4" size={64} />
            <p className="text-xl font-medium">No products found</p>
            <p className="text-sm mt-2">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <AgGridReact
            rowData={filteredProducts}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true,
            }}
            pagination={true}
            paginationPageSize={20}
            rowSelection="multiple"
            animateRows={true}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            rowHeight={55}
            headerHeight={50}
            getRowStyle={(params: any) => {
              if (params.node.rowIndex % 2 === 0) {
                return { backgroundColor: '#fafafa' };
              }
              return { backgroundColor: '#ffffff' };
            }}
          />
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProductId(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingProduct?.data || null}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
