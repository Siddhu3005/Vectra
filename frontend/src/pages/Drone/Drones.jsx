import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import TableToolbar from '../../components/TableToolbar';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { paginate, pageCount } from '../../utils/pagination';
import * as service from '../../services/droneService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const empty = { droneCode: '', serialNumber: '', model: '', payloadCapacity: '', batteryPercentage: 100, batteryPerKm: '', batteryPerKg: '', minimumReserve: 20, currentLocation: '' };

export default function Drones() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const notify = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: empty });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setDrones(await service.getDrones());
    } catch (e) {
      const message = errorMessage(e);
      setError(message);
      notify(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openForm = (drone = {}) => { setEditing(drone); reset({ ...empty, ...drone }); };
  const openDetails = async (id) => {
    try {
      setViewing(await service.getDrone(id));
      setDetailTab('overview');
      setHistory(null);
      setHistoryError('');
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const loadHistory = async (droneId = viewing?.droneId) => {
    if (!droneId) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      setHistory(await service.getDroneHistory(droneId));
    } catch (e) {
      const message = errorMessage(e);
      setHistoryError(message);
      notify(message, 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const selectTab = (tab) => {
    setDetailTab(tab);
    if (tab === 'history' && !history && !historyLoading) loadHistory();
  };

  const save = async (data) => {
    try {
      if (editing?.droneId) await service.updateDrone(editing.droneId, data); else await service.createDrone(data);
      notify(`Drone ${editing?.droneId ? 'updated' : 'added'} successfully`);
      setEditing(null);
      await load();
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const remove = async () => {
    try {
      await service.deleteDrone(deleting.droneId);
      notify('Drone removed');
      setDeleting(null);
      await load();
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const filtered = useMemo(() => drones.filter((d) =>
    (!filter || d.status === filter) && [d.droneCode, d.serialNumber, d.model, d.currentLocation].some((x) => x?.toLowerCase().includes(search.toLowerCase()))), [drones, search, filter]);
  const pages = pageCount(filtered, 8), rows = paginate(filtered, Math.min(page, pages), 8);
  const columns = [
    { key: 'droneCode', label: 'Aircraft', render: (d) => <div className="record-id"><span><i className="bi bi-airplane-engines" /></span><div><strong>{d.droneCode}</strong><small>{d.model}</small></div></div> },
    { key: 'serialNumber', label: 'Serial number', render: (d) => <code>{d.serialNumber}</code> },
    { key: 'batteryPercentage', label: 'Battery', render: (d) => <div className="battery-cell"><span>{Math.round(d.batteryPercentage)}%</span><div><i style={{ width: `${d.batteryPercentage}%` }} className={d.batteryPercentage < d.minimumReserve ? 'low' : ''} /></div></div> },
    { key: 'payloadCapacity', label: 'Payload', render: (d) => `${d.payloadCapacity} kg` },
    { key: 'currentLocation', label: 'Location' },
    { key: 'status', label: 'Status', render: (d) => <StatusBadge value={d.status} /> },
    { key: 'actions', label: '', render: (d) => <div className="row-actions"><button onClick={() => openDetails(d.droneId)} title="View"><i className="bi bi-eye" /></button><button onClick={() => openForm(d)} title="Edit"><i className="bi bi-pencil" /></button><button className="danger" onClick={() => setDeleting(d)} title="Delete"><i className="bi bi-trash3" /></button></div> },
  ];

  if (loading) return <Loader label="Loading fleet" />;
  if (error) return <EmptyState icon="bi-wifi-off" title="Drone fleet could not load" message={error} action={<button className="btn btn-primary btn-sm" onClick={load}>Retry</button>} />;

  return <>
    <PageHeader eyebrow="FLEET REGISTRY" title="Drone Fleet" description={`${drones.length} aircraft registered across your operations.`}
      action={<button className="btn btn-primary app-button" onClick={() => openForm()}><i className="bi bi-plus-lg" /> Add drone</button>} />
    <section className="panel data-panel"><TableToolbar search={search} onSearch={(x) => { setSearch(x); setPage(1); }} filter={filter} onFilter={setFilter} options={['AVAILABLE', 'ASSIGNED', 'IN_MISSION', 'CHARGING', 'MAINTENANCE', 'OFFLINE']} placeholder="Search code, model, serial or location…" />
      <DataTable columns={columns} rows={rows} keyField="droneId" empty={{ icon: 'bi-airplane', title: 'No drones found', message: 'Adjust your filters or add the first aircraft.' }} />
      <Pagination page={Math.min(page, pages)} pages={pages} onChange={setPage} /></section>

    <Modal open={editing !== null} title={editing?.droneId ? 'Edit aircraft' : 'Register new aircraft'} subtitle="Configure identity, performance and battery characteristics." onClose={() => setEditing(null)} size="modal-lg">
      <form onSubmit={handleSubmit(save)}><div className="form-grid">
        <Field label="Drone code" error={errors.droneCode}><input {...register('droneCode', { required: true })} placeholder="VTR-001" /></Field>
        <Field label="Serial number" error={errors.serialNumber}><input {...register('serialNumber', { required: true })} placeholder="SN-2026-001" /></Field>
        <Field label="Model" error={errors.model}><input {...register('model', { required: true })} placeholder="AeroLift X4" /></Field>
        <Field label="Current location" error={errors.currentLocation}><input {...register('currentLocation', { required: true })} placeholder="Warehouse A" /></Field>
        <Field label="Payload capacity (kg)" error={errors.payloadCapacity}><input type="number" step="0.1" {...register('payloadCapacity', { required: true, min: 0.1, valueAsNumber: true })} /></Field>
        <Field label="Battery percentage" error={errors.batteryPercentage}><input type="number" {...register('batteryPercentage', { required: true, min: 0, max: 100, valueAsNumber: true })} /></Field>
        <Field label="Battery per km" error={errors.batteryPerKm}><input type="number" step="0.01" {...register('batteryPerKm', { required: true, min: 0, valueAsNumber: true })} /></Field>
        <Field label="Battery per kg" error={errors.batteryPerKg}><input type="number" step="0.01" {...register('batteryPerKg', { required: true, min: 0, valueAsNumber: true })} /></Field>
        <Field label="Minimum reserve (%)" error={errors.minimumReserve}><input type="number" {...register('minimumReserve', { required: true, min: 0, max: 100, valueAsNumber: true })} /></Field>
      </div><FormActions close={() => setEditing(null)} busy={isSubmitting} /></form>
    </Modal>

    <Modal open={Boolean(viewing)} title={viewing?.droneCode} subtitle={viewing?.model} onClose={() => setViewing(null)} size="modal-lg">
      {viewing && <>
        <div className="auth-tabs mb-3">
          <button type="button" className={detailTab === 'overview' ? 'active' : ''} onClick={() => selectTab('overview')}>Overview</button>
          <button type="button" className={detailTab === 'history' ? 'active' : ''} onClick={() => selectTab('history')}>History</button>
        </div>
        {detailTab === 'overview' ? (
          <div className="detail-grid">{[['Status', <StatusBadge value={viewing.status} />], ['Serial', viewing.serialNumber], ['Battery', `${viewing.batteryPercentage}%`], ['Payload', `${viewing.payloadCapacity} kg`], ['Flight count', viewing.flightCount], ['Location', viewing.currentLocation]].map(([a, b]) => <div key={a}><span>{a}</span><strong>{b}</strong></div>)}</div>
        ) : (
          <DroneHistory history={history} loading={historyLoading} error={historyError} onRetry={() => loadHistory()} />
        )}
      </>}
    </Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Remove aircraft?" message={`${deleting?.droneCode} will be permanently removed from the fleet registry.`} onCancel={() => setDeleting(null)} onConfirm={remove} />
  </>;
}

function DroneHistory({ history, loading, error, onRetry }) {
  const assignments = history?.assignments || [];
  if (loading) return <Loader label="Loading drone history" />;
  if (error) return <EmptyState icon="bi-wifi-off" title="History could not load" message={error} action={<button className="btn btn-primary btn-sm" onClick={onRetry}>Retry</button>} />;
  const columns = [
    { key: 'mission', label: 'Mission name', render: (assignment) => missionLabel(assignment.mission) },
    { key: 'operator', label: 'Operator', render: (assignment) => assignment.operator?.user?.fullName || assignment.operator?.licenseNumber || '—' },
    { key: 'assignedTime', label: 'Assigned time', render: (assignment) => formatDateTime(assignment.assignedTime) },
    { key: 'startTime', label: 'Started time', render: (assignment) => formatDateTime(assignment.mission?.startTime) },
    { key: 'endTime', label: 'Completed time', render: (assignment) => formatDateTime(assignment.mission?.endTime) },
    { key: 'missionStatus', label: 'Mission status', render: (assignment) => <StatusBadge value={assignment.mission?.missionStatus} /> },
    { key: 'assignmentStatus', label: 'Assignment status', render: (assignment) => <StatusBadge value={assignment.assignmentStatus} /> },
  ];
  return <DataTable columns={columns} rows={assignments} keyField="assignmentId" empty={{ icon: 'bi-clock-history', title: 'No flight history yet', message: 'Completed and assigned missions for this drone will appear here.' }} />;
}

function missionLabel(mission) {
  if (!mission) return '—';
  return <span><strong>MSN-{String(mission.missionId).padStart(4, '0')}</strong><small className="d-block text-muted">{mission.missionType || 'Mission'}</small></span>;
}
function formatDateTime(value) { return value ? String(value).replace('T', ' ') : '—'; }
function Field({ label, error, children }) { return <label className="form-field"><span>{label}</span>{children}{error && <small>This field is required or invalid.</small>}</label>; }
function FormActions({ close, busy }) { return <div className="modal-actions"><button type="button" className="btn btn-light" onClick={close} disabled={busy}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save aircraft'}</button></div>; }
