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
    
    // Add event listeners for action buttons
    const gridElement = params.api.getGridElement();
    
    gridElement.addEventListener('click', (e: any) => {
      const target = e.target as HTMLElement;
      
      // Handle edit button
      if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
        const btn = target.classList.contains('edit-btn') ? target : target.closest('.edit-btn');
        const productId = btn?.getAttribute('data-id');
        if (productId) {
          console.log('Edit product:', productId);
          alert(`Édition du produit #${productId} - Fonctionnalité à implémenter`);
        }
      }
      
      // Handle delete button
      if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
        const btn = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn');
        const productId = btn?.getAttribute('data-id');
        if (productId && window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
          deleteProduct.mutate(Number(productId));
        }
      }
    });
  }, [deleteProduct]);

  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 90, 
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellStyle: { fontWeight: '600', color: '#0369a1' }
    },
    { 
      field: 'product_display_name', 
      headerName: 'Produit', 
      flex: 2, 
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' }
    },
    { 
      field: 'price', 
      headerName: 'Prix', 
      width: 120, 
      valueFormatter: (p) => `${p.value} €`,
      cellStyle: { fontWeight: '700', color: '#16a34a', textAlign: 'right' },
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'master_category', 
      headerName: 'Catégorie', 
      width: 150,
      filter: true 
    },
    { 
      field: 'gender', 
      headerName: 'Genre', 
      width: 100,
      filter: true,
      cellStyle: (params: any) => ({
        backgroundColor: params.value === 'Men' ? '#dbeafe' : 
                         params.value === 'Women' ? '#fce7f3' : '#f3f4f6',
        fontWeight: '600',
        textAlign: 'center'
      })
    },
    { 
      field: 'season', 
      headerName: 'Saison', 
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
              ✏️ Modifier
            </button>
            <button 
              class="delete-btn"
              data-id="${params.data.id}"
              style="padding: 6px 12px; background-color: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500;"
              onmouseover="this.style.backgroundColor='#dc2626'"
              onmouseout="this.style.backgroundColor='#ef4444'"
            >
              🗑️ Supprimer
            </button>
          </div>
        `;
      }
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
          onGridReady={onGridReady}
          rowHeight={55}
          headerHeight={50}
          getRowStyle={(params: any) => {
            if (params.node.rowIndex % 2 === 0) {
              return { backgroundColor: '#fafafa' };
            }
            return { backgroundColor: '#ffffff' };
          }}
        />
      </div>
    </div>
  );
}