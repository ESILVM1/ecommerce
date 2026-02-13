import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useMemo } from 'react';
import type { SalesStats } from '../types/analytics.types';
import { formatPrice, formatDate } from '../../../lib/utils';

interface Props {
  data: SalesStats;
}

export default function SalesStatsGrid({ data }: Props) {
  const columnDefs = useMemo(() => [
    { 
      field: 'order_number', 
      headerName: 'N° Commande',
      flex: 1,
      filter: true,
      cellStyle: { fontWeight: '600', color: '#0369a1' },
    },
    { 
      field: 'user__email', 
      headerName: 'Client',
      flex: 1.5,
      filter: true,
    },
    { 
      field: 'status', 
      headerName: 'Statut',
      flex: 1,
      filter: true,
      cellRenderer: (params: any) => {
        const statusLabels: Record<string, string> = {
          pending: 'En attente',
          confirmed: 'Confirmée',
          shipped: 'Expédiée',
          delivered: 'Livrée',
          cancelled: 'Annulée',
        };
        const bgColors: Record<string, string> = {
          pending: '#fef3c7',
          confirmed: '#dbeafe',
          shipped: '#e9d5ff',
          delivered: '#d1fae5',
          cancelled: '#fee2e2',
        };
        const textColors: Record<string, string> = {
          pending: '#92400e',
          confirmed: '#1e40af',
          shipped: '#6b21a8',
          delivered: '#065f46',
          cancelled: '#991b1b',
        };
        return `<span style="background-color: ${bgColors[params.value]}; color: ${textColors[params.value]}; padding: 4px 12px; border-radius: 9999px; font-size: 0.875rem; font-weight: 500;">${statusLabels[params.value] || params.value}</span>`;
      },
    },
    { 
      field: 'payment_status', 
      headerName: 'Paiement',
      flex: 1,
      filter: true,
      cellRenderer: (params: any) => {
        const paymentLabels: Record<string, string> = {
          paid: '✓ Payé',
          pending: '⏳ En attente',
          failed: '✗ Échoué',
          refunded: '↩ Remboursé',
        };
        const colors: Record<string, string> = {
          paid: '#16a34a',
          pending: '#ca8a04',
          failed: '#dc2626',
          refunded: '#2563eb',
        };
        return `<span style="color: ${colors[params.value]}; font-weight: 600;">${paymentLabels[params.value] || params.value}</span>`;
      },
    },
    { 
      field: 'final_amount', 
      headerName: 'Montant',
      flex: 1,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: any) => formatPrice(params.value),
      sort: 'desc',
      cellStyle: { fontWeight: '700', color: '#0284c7', textAlign: 'right' },
    },
    { 
      field: 'created_at', 
      headerName: 'Date',
      flex: 1,
      filter: 'agDateColumnFilter',
      valueFormatter: (params: any) => formatDate(params.value),
      cellStyle: { color: '#64748b' },
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact
        rowData={data.recent_orders}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        domLayout="normal"
        rowHeight={50}
        headerHeight={50}
        animateRows={true}
      />
    </div>
  );
}
