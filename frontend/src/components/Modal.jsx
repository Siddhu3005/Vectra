import { useEffect } from 'react';

export default function Modal({ open, title, subtitle, onClose, children, size = '' }) {
  useEffect(() => {
    const close = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);
  if (!open) return null;
  return <div className="modal-shell" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className={`modal-panel ${size}`}>
      <div className="modal-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg" /></button></div>
      {children}
    </div>
  </div>;
}
