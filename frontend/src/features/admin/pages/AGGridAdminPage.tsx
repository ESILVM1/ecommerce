import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

const rowData: UserRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'User' },
];

const columnDefs: ColDef<UserRow>[] = [
  { headerName: 'ID', field: 'id', sortable: true, filter: true },
  { headerName: 'Nom', field: 'name', sortable: true, filter: true },
  { headerName: 'Email', field: 'email', sortable: true, filter: true },
  { headerName: 'Rôle', field: 'role', sortable: true, filter: true },
];

const AGGridAdminPage: React.FC = () => {
  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact<UserRow> rowData={rowData} columnDefs={columnDefs} />
    </div>
  );
};

export default AGGridAdminPage;
