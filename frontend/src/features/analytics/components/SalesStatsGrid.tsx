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
    },
    { 
      field: 'user__email', 
      headerName: 'Client',
      flex: 1,
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
        return statusLabels[params.value] || params.value;
      },
    },
    { 
      field: 'payment_status', 
      headerName: 'Paiement',
      flex: 1,
      filter: true,
      cellRenderer: (params: any) => {
        const paymentLabels: Record<string, string> = {
          paid: 'Payé',
          pending: 'En attente',
          failed: 'Échoué',
          refunded: 'Remboursé',
        };
        const colorClasses: Record<string, string> = {
          paid: 'text-green-600',
          pending: 'text-yellow-600',
          failed: 'text-red-600',
          refunded: 'text-blue-600',
        };
        return `<span class="${colorClasses[params.value] || ''}">${paymentLabels[params.value] || params.value}</span>`;
      },
    },
    { 
      field: 'final_amount', 
      headerName: 'Montant',
      flex: 1,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: any) => formatPrice(params.value),
      sort: 'desc',
    },
    { 
      field: 'created_at', 
      headerName: 'Date',
      flex: 1,
      filter: 'agDateColumnFilter',
      valueFormatter: (params: any) => formatDate(params.value),
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), []);

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={data.recent_orders}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        domLayout="normal"
      />
    </div>
  );
}
