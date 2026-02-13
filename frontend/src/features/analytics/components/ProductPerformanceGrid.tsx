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
      headerName: '#',
      valueGetter: 'node.rowIndex + 1',
      width: 60,
      cellStyle: (params: any) => {
        if (params.node.rowIndex < 3) {
          return { 
            backgroundColor: params.node.rowIndex === 0 ? '#fef3c7' : 
                            params.node.rowIndex === 1 ? '#e5e7eb' : 
                            '#fed7aa',
            fontWeight: '700',
            textAlign: 'center'
          };
        }
        return { textAlign: 'center', color: '#64748b' };
      },
    },
    { 
      field: 'product__product_display_name', 
      headerName: 'Produit',
      flex: 2,
      filter: true,
      cellStyle: { fontWeight: '500' },
    },
    { 
      field: 'total_quantity', 
      headerName: 'Quantité',
      flex: 1,
      filter: 'agNumberColumnFilter',
      sort: 'desc',
      cellStyle: (params: any) => {
        const value = params.value;
        return {
          fontWeight: '700',
          color: value > 50 ? '#16a34a' : value > 20 ? '#ca8a04' : '#64748b',
          textAlign: 'center',
        };
      },
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
      cellStyle: { 
        fontWeight: '700', 
        color: '#0284c7',
        textAlign: 'right',
      },
    },
    { 
      field: 'order_count', 
      headerName: 'Commandes',
      flex: 1,
      filter: 'agNumberColumnFilter',
      cellStyle: { 
        textAlign: 'center',
        backgroundColor: '#f1f5f9',
        fontWeight: '600',
      },
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  const getRowStyle = (params: any) => {
    if (params.node.rowIndex % 2 === 0) {
      return { backgroundColor: '#fafafa' };
    }
    return { backgroundColor: '#ffffff' };
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact
        rowData={data.top_selling_products}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        domLayout="normal"
        rowHeight={55}
        headerHeight={50}
        getRowStyle={getRowStyle}
        animateRows={true}
      />
    </div>
  );
}
