import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useMemo } from 'react';
import type { ProductPerformance } from '../types/analytics.types';

interface Props {
  data: ProductPerformance;
}

export default function ProductPerformanceGrid({ data }: Props) {
  const columnDefs = useMemo(() => [
    { 
      field: 'product__product_display_name', 
      headerName: 'Produit',
      flex: 2,
      filter: true,
    },
    { 
      field: 'total_quantity', 
      headerName: 'Quantité Vendue',
      flex: 1,
      filter: 'agNumberColumnFilter',
      sort: 'desc',
    },
    { 
      field: 'total_revenue', 
      headerName: 'Revenu Total',
      flex: 1,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: any) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(params.value);
      },
    },
    { 
      field: 'order_count', 
      headerName: 'Nb Commandes',
      flex: 1,
      filter: 'agNumberColumnFilter',
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), []);

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={data.top_selling_products}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        domLayout="normal"
      />
    </div>
  );
}
