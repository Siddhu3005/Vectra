export default function EmptyState({ icon = 'bi-inbox', title = 'Nothing here yet', message = 'New records will appear here.', action }) {
  return <div className="empty-state"><i className={`bi ${icon}`} /><h3>{title}</h3><p>{message}</p>{action && <div className="mt-3">{action}</div>}</div>;
}
