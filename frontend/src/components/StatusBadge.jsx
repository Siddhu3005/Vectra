const styles = {
  AVAILABLE: 'success', COMPLETED: 'success', APPROVED: 'success',
  PENDING: 'warning', CHARGING: 'info', IN_PROGRESS: 'info', IN_MISSION: 'info', RECOMMENDED: 'primary',
  MAINTENANCE: 'danger', OFFLINE: 'secondary', FAILED: 'danger', CANCELLED: 'secondary',
  ASSIGNED: 'primary', ACCEPTED: 'primary', BUSY: 'warning', ACTIVE: 'success', INACTIVE: 'secondary', EMERGENCY: 'danger', HIGH: 'warning',
  MEDIUM: 'info', LOW: 'secondary',
};
export default function StatusBadge({ value }) {
  return <span className={`status-badge status-${styles[value] || 'secondary'}`}>{String(value || 'N/A').replaceAll('_', ' ')}</span>;
}
