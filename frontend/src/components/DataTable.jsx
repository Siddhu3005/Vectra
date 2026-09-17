import EmptyState from './EmptyState';
export default function DataTable({ columns, rows, keyField = 'id', empty }) {
  if (!rows.length) return <EmptyState {...empty} />;
  return <div className="table-responsive"><table className="table app-table align-middle mb-0">
    <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={row[keyField] ?? index}>
      {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
    </tr>)}</tbody>
  </table></div>;
}
