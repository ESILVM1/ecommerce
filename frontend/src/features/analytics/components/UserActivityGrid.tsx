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
      flex: 1,
      filter: true,
      valueFormatter: (params: any) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      },
    },
    { 
      field: 'count', 
      headerName: 'Nouvelles Inscriptions',
      flex: 1,
      filter: 'agNumberColumnFilter',
      sort: 'desc',
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), []);

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={data.registrations_by_month}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={12}
        domLayout="normal"
      />
    </div>
  );
}
