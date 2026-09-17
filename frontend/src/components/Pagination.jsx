export default function Pagination({ page, pages, onChange }) {
  return <div className="pagination-row"><span>Page {page} of {pages}</span><div>
    <button disabled={page === 1} onClick={() => onChange(page - 1)}><i className="bi bi-chevron-left" /></button>
    <button disabled={page === pages} onClick={() => onChange(page + 1)}><i className="bi bi-chevron-right" /></button>
  </div></div>;
}
