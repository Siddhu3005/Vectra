export default function TableToolbar({ search, onSearch, filter, onFilter, options, placeholder = 'Search records…' }) {
  return <div className="table-toolbar"><div className="search-box"><i className="bi bi-search" /><input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} /></div>
    {options && <select value={filter} onChange={(e) => onFilter(e.target.value)}><option value="">All statuses</option>{options.map((x) => <option key={x}>{x}</option>)}</select>}</div>;
}
