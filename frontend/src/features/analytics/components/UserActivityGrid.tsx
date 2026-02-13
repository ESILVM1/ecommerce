import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useMemo } from 'react';
import type { UserActivity } from '../types/analytics.types';

interface Props {
  data: UserActivity;
}

export default function UserActivityGrid({ data }: Props) {
  const columnDefs = useMemo(() => [
    { 
      field: 'month', 
      headerName: 'Mois',
      flex: 2,
      filter: true,
      valueFormatter: (params: any) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      },
      cellStyle: { 
        fontWeight: '600',
        color: '#1e40af',
      },
    },
    { 
      field: 'count', 
      headerName: 'Nouvelles Inscriptions',
      flex: 1,
      filter: 'agNumberColumnFilter',
      sort: 'desc',
      cellRenderer: (params: any) => {
        const value = params.value;
        const barWidth = Math.min((value / 20) * 100, 100); // Scale to max 20
        return `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="flex: 1; background: linear-gradient(to right, #3b82f6 0%, #60a5fa ${barWidth}%, #e5e7eb ${barWidth}%, #e5e7eb 100%); height: 24px; border-radius: 4px; position: relative;">
              <span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-weight: 700; color: ${value > 10 ? '#ffffff' : '#1e40af'}; font-size: 0.875rem;">
                ${value}
              </span>
            </div>
          </div>
        `;
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
      return { backgroundColor: '#f8fafc' };
    }
    return { backgroundColor: '#ffffff' };
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 450, width: '100%' }}>
      <AgGridReact
        rowData={data.registrations_by_month}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={12}
        domLayout="normal"
        rowHeight={55}
        headerHeight={50}
        getRowStyle={getRowStyle}
        animateRows={true}
      />
    </div>
  );
}
