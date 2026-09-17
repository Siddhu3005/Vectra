import Modal from './Modal';
export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, busy }) {
  return <Modal open={open} title={title} onClose={onCancel}>
    <p className="text-secondary mb-4">{message}</p>
    <div className="d-flex justify-content-end gap-2">
      <button className="btn btn-light" onClick={onCancel}>Cancel</button>
      <button className="btn btn-danger" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Delete record'}</button>
    </div>
  </Modal>;
}
