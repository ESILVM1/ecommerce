import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
// Correction import : Utilisation de 'type' pour verbatimModuleSyntax
import { type ColDef, type GridReadyEvent } from 'ag-grid-community';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProducts } from '../../shop/hooks/useProducts';
import { useAdminProducts } from '../hooks/useAdminProducts';

// Import des styles AG Grid
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function ProductManagement() {
  const { data, isLoading } = useProducts();
  const { deleteProduct } = useAdminProducts();

  // Correction erreur ts(6133) : Utilisation du type importé
  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 90, 
      checkboxSelection: true,
      headerCheckboxSelection: true 
    },
    { field: 'name', headerName: 'Produit', flex: 1, filter: 'agTextColumnFilter' },
    { 
      field: 'price', 
      headerName: 'Prix', 
      width: 120, 
      valueFormatter: (p) => `${p.value} €`,
      cellClass: 'font-semibold text-green-700'
    },
    { field: 'category', headerName: 'Catégorie', width: 150 },
    {
      headerName: 'Actions',
      width: 120,
      pinned: 'right', // Pratique pour garder les actions visibles
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full gap-3">
          <button 
            onClick={() => console.log('Edit:', params.data)}
            className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
            title="Modifier"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => { if(window.confirm('Supprimer ce produit ?')) deleteProduct(params.data.id) }}
            className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ], [deleteProduct]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue Produits</h1>
          <p className="text-gray-500">Gérez vos 44,000 articles en temps réel.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus size={20} />
          Nouveau Produit
        </button>
      </div>

      <div className="ag-theme-alpine w-full flex-grow shadow-md rounded-xl overflow-hidden" style={{ height: '70vh' }}>
        <AgGridReact
          rowData={data?.results || []}
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
          loading={isLoading}
          onGridReady={onGridReady} // Utilisation de l'event pour valider l'import
        />
      </div>
    </div>
  );
}