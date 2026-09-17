import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import TableToolbar from '../../components/TableToolbar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import * as service from '../../services/missionService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const initial = { missionType: 'DELIVERY', pickupLocation: '', destination: '', packageWeight: '', currentToPickupDistance: '', pickupToDestinationDistance: '', destinationToWarehouseDistance: '', priority: 'MEDIUM' };
const statusFilters = ['PENDING', 'RECOMMENDED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'];

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [actionBusy, setActionBusy] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const notify = useToast();
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';
  const canCreate = !isOperator;
  const canEdit = !isOperator;
  const canStartComplete = isOperator || user?.role === 'ADMIN';
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: initial });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setMissions(await service.getMissions());
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

  const open = (m = {}) => { setEditing(m); reset({ ...initial, ...m }); };
  const view = async (id) => {
    try {
      setViewing(await service.getMission(id));
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const save = async (data) => {
    try {
      editing?.missionId ? await service.updateMission(editing.missionId, data) : await service.createMission(data);
      notify('Mission saved successfully');
      setEditing(null);
      await load();
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const runMissionAction = async (action) => {
    if (!viewing?.missionId || actionBusy) return;
    setActionBusy(action);
    try {
      const updated = action === 'start'
        ? await service.startMission(viewing.missionId)
        : await service.completeMission(viewing.missionId);
      setViewing(updated);
      setMissions((items) => items.map((mission) => mission.missionId === updated.missionId ? updated : mission));
      notify(action === 'start' ? 'Mission started successfully' : 'Mission completed successfully');
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setActionBusy('');
    }
  };

  const filtered = useMemo(() => missions.filter((m) => (!filter || m.missionStatus === filter) && [m.pickupLocation, m.destination, m.missionType, `MSN-${m.missionId}`].some((x) => x?.toLowerCase().includes(search.toLowerCase()))), [missions, search, filter]);
  const columns = [
    { key: 'missionId', label: 'Mission', render: (m) => <div className="record-id"><span><i className="bi bi-signpost-split" /></span><div><strong>MSN-{String(m.missionId).padStart(4, '0')}</strong><small>{m.missionType}</small></div></div> },
    { key: 'route', label: 'Route', render: (m) => <div className="route-cell"><strong>{m.pickupLocation}</strong><span><i className="bi bi-arrow-right" /> {m.destination}</span></div> },
    { key: 'packageWeight', label: 'Payload', render: (m) => `${m.packageWeight} kg` },
    { key: 'totalDistance', label: 'Distance', render: (m) => `${m.totalDistance?.toFixed?.(1) ?? m.totalDistance} km` },
    { key: 'priority', label: 'Priority', render: (m) => <StatusBadge value={m.priority} /> },
    { key: 'missionStatus', label: 'Status', render: (m) => <StatusBadge value={m.missionStatus} /> },
    { key: 'actions', label: '', render: (m) => <div className="row-actions">
      <button onClick={() => view(m.missionId)} title="View workflow"><i className="bi bi-eye" /></button>
      {canEdit && <button disabled={m.missionStatus !== 'PENDING'} onClick={() => open(m)} title="Edit"><i className="bi bi-pencil" /></button>}
    </div> },
  ];

  if (loading) return <Loader label="Loading missions" />;
  if (error) return <EmptyState icon="bi-wifi-off" title="Missions could not load" message={error} action={<button className="btn btn-primary btn-sm" onClick={load}>Retry</button>} />;

  return <>
    <PageHeader eyebrow="MISSION CONTROL" title="Missions" description="Plan, prioritize and monitor every operation from dispatch to completion."
      action={canCreate && <button className="btn btn-primary app-button" onClick={() => open()}><i className="bi bi-plus-lg" /> Create mission</button>} />
    <section className="panel data-panel"><TableToolbar search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusFilters} placeholder="Search mission, route or type…" />
      <DataTable columns={columns} rows={filtered} keyField="missionId" empty={{ icon: 'bi-map', title: 'No missions found', message: 'Try a different search or status filter.' }} /></section>

    <Modal open={editing !== null} title={editing?.missionId ? 'Update mission' : 'Create mission'} subtitle="Define the route, payload and operational priority." onClose={() => setEditing(null)} size="modal-lg">
      <form onSubmit={handleSubmit(save)}><div className="form-grid">
        <Field label="Mission type" error={errors.missionType}><select {...register('missionType', { required: true })}>{['DELIVERY', 'MEDICAL', 'INSPECTION', 'SURVEILLANCE', 'AGRICULTURE'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Priority" error={errors.priority}><select {...register('priority', { required: true })}>{['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Pickup location" error={errors.pickupLocation}><input {...register('pickupLocation', { required: true })} placeholder="Warehouse A" /></Field>
        <Field label="Destination" error={errors.destination}><input {...register('destination', { required: true })} placeholder="City Medical Center" /></Field>
        <Field label="Package weight (kg)" error={errors.packageWeight}><input type="number" step="0.1" {...register('packageWeight', { required: true, min: 0.1, valueAsNumber: true })} /></Field>
        <Field label="Current to pickup (km)" error={errors.currentToPickupDistance}><input type="number" step="0.1" {...register('currentToPickupDistance', { required: true, min: 0, valueAsNumber: true })} /></Field>
        <Field label="Pickup to destination (km)" error={errors.pickupToDestinationDistance}><input type="number" step="0.1" {...register('pickupToDestinationDistance', { required: true, min: 0, valueAsNumber: true })} /></Field>
        <Field label="Destination to warehouse (km)" error={errors.destinationToWarehouseDistance}><input type="number" step="0.1" {...register('destinationToWarehouseDistance', { required: true, min: 0, valueAsNumber: true })} /></Field>
      </div><div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setEditing(null)} disabled={isSubmitting}>Cancel</button><button className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save mission'}</button></div></form>
    </Modal>

    <Modal open={Boolean(viewing)} title={`Mission MSN-${String(viewing?.missionId || '').padStart(4, '0')}`} subtitle={`${viewing?.pickupLocation || ''} → ${viewing?.destination || ''}`} onClose={() => setViewing(null)} size="modal-lg">
      <MissionStepper status={viewing?.missionStatus} />
      <div className="detail-grid mt-4">
        <Detail label="Type" value={viewing?.missionType} /><Detail label="Priority" value={viewing?.priority} />
        <Detail label="Status" value={<StatusBadge value={viewing?.missionStatus} />} /><Detail label="Payload" value={`${viewing?.packageWeight} kg`} />
        <Detail label="Total distance" value={`${viewing?.totalDistance} km`} /><Detail label="Battery required" value={`${viewing?.estimatedBatteryRequired || 0}%`} />
        <Detail label="Start time" value={formatDateTime(viewing?.startTime)} /><Detail label="End time" value={formatDateTime(viewing?.endTime)} />
      </div>
      {canStartComplete && ['ASSIGNED', 'IN_PROGRESS'].includes(viewing?.missionStatus) && (
        <div className="modal-actions">
          {viewing?.missionStatus === 'ASSIGNED' && <button className="btn btn-primary" disabled={Boolean(actionBusy)} onClick={() => runMissionAction('start')}><i className="bi bi-play-fill" /> {actionBusy === 'start' ? 'Starting…' : 'Start Mission'}</button>}
          {viewing?.missionStatus === 'IN_PROGRESS' && <button className="btn btn-success" disabled={Boolean(actionBusy)} onClick={() => runMissionAction('complete')}><i className="bi bi-check2-circle" /> {actionBusy === 'complete' ? 'Completing…' : 'Complete Mission'}</button>}
        </div>
      )}
    </Modal>
  </>;
}

function Field({ label, error, children }) { return <label className="form-field"><span>{label}</span>{children}{error && <small>Provide a valid value.</small>}</label>; }
function Detail({ label, value }) { return <div><span>{label}</span><strong>{value || '—'}</strong></div>; }
function formatDateTime(value) { return value ? String(value).replace('T', ' ') : '—'; }
function MissionStepper({ status }) {
  const steps = ['PENDING', 'RECOMMENDED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
  const backendOrder = { PENDING: 0, RECOMMENDED: 1, ASSIGNED: 2, IN_PROGRESS: 3, COMPLETED: 4, FAILED: 4 };
  const current = backendOrder[status] ?? steps.indexOf(status);
  return <div className="mission-stepper">{steps.map((step, i) => <div className={i <= current ? 'done' : ''} key={step}><span>{i < current ? <i className="bi bi-check-lg" /> : i + 1}</span><small>{step.replaceAll('_', ' ')}</small></div>)}</div>;
}
