import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { getMissions } from '../../services/missionService';
import { getOperators } from '../../services/operatorService';
import { assignDrone, assignOperator, getAssignments, getRecommendedAssignments } from '../../services/assignmentService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const missionCode = (id) => `MSN-${String(id || '').padStart(4, '0')}`;
const assignmentCode = (id) => `ASN-${String(id || '').padStart(4, '0')}`;
const operatorName = (operator) => operator?.user?.fullName || operator?.fullName || operator?.licenseNumber || '—';

export default function Assignments() {
  const [missions, setMissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [operatorId, setOperatorId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const notify = useToast();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [missionRows, assignmentRows, recommendedRows, operatorRows] = await Promise.all([
        getMissions(),
        getAssignments(),
        getRecommendedAssignments(),
        getOperators(),
      ]);
      setMissions(Array.isArray(missionRows) ? missionRows : []);
      setAssignments(Array.isArray(assignmentRows) ? assignmentRows : []);
      setRecommended(Array.isArray(recommendedRows) ? recommendedRows : []);
      setOperators(Array.isArray(operatorRows) ? operatorRows : []);
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

  const recommend = async (missionId) => {
    setBusy(`mission-${missionId}`);
    try {
      const result = await assignDrone(missionId);
      notify(`${result.drone?.droneCode || 'Drone'} recommended successfully`);
      await load();
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setBusy(null);
    }
  };

  const openAssignOperator = (assignment) => {
    setAssigning(assignment);
    setOperatorId(assignment.operator?.operatorId ? String(assignment.operator.operatorId) : '');
  };

  const submitOperator = async (event) => {
    event.preventDefault();
    if (!operatorId) {
      notify('Select an operator before assigning.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await assignOperator(assigning.assignmentId, Number(operatorId));
      notify('Operator assigned successfully');
      setAssigning(null);
      setOperatorId('');
      await load();
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pending = useMemo(() => missions.filter((m) => m.missionStatus === 'PENDING'), [missions]);
  const availableOperators = useMemo(() => operators.filter((operator) => operator.availabilityStatus !== 'BUSY'), [operators]);

  const pendingColumns = [
    { key: 'missionId', label: 'Mission', render: (m) => <strong>{missionCode(m.missionId)}</strong> },
    { key: 'route', label: 'Route', render: (m) => `${m.pickupLocation} → ${m.destination}` },
    { key: 'packageWeight', label: 'Payload', render: (m) => `${m.packageWeight} kg` },
    { key: 'priority', label: 'Priority', render: (m) => <StatusBadge value={m.priority} /> },
    { key: 'missionStatus', label: 'Status', render: (m) => <StatusBadge value={m.missionStatus} /> },
    { key: 'action', label: '', render: (m) => <button className="btn btn-sm btn-primary" disabled={busy === `mission-${m.missionId}`} onClick={() => recommend(m.missionId)}><i className="bi bi-stars" /> {busy === `mission-${m.missionId}` ? 'Evaluating…' : 'Find best drone'}</button> },
  ];

  const assignmentColumns = [
    { key: 'assignmentId', label: 'Assignment', render: (a) => <strong>{assignmentCode(a.assignmentId)}</strong> },
    { key: 'mission', label: 'Mission', render: (a) => <span>{missionCode(a.mission?.missionId)}<small className="d-block text-muted">{a.mission?.missionType || 'Mission'}</small></span> },
    { key: 'drone', label: 'Drone', render: (a) => <div className="record-id"><span><i className="bi bi-airplane-engines" /></span><div><strong>{a.drone?.droneCode || '—'}</strong><small>{a.drone?.model || 'No model'}</small></div></div> },
    { key: 'distance', label: 'Distance', render: (a) => a.mission?.totalDistance != null ? `${Number(a.mission.totalDistance).toFixed(1)} km` : '—' },
    { key: 'batteryRequired', label: 'Battery req.', render: (a) => a.mission?.estimatedBatteryRequired != null ? <span className="status-badge status-warning">{Number(a.mission.estimatedBatteryRequired).toFixed(1)}%</span> : '—' },
    { key: 'batteryRemaining', label: 'Remaining', render: (a) => {
      const req = a.mission?.estimatedBatteryRequired;
      const cur = a.drone?.batteryPercentage;
      if (req == null || cur == null) return '—';
      const rem = cur - req;
      return <span className={`status-badge ${rem < (a.drone?.minimumReserve ?? 20) ? 'status-danger' : 'status-success'}`}>{rem.toFixed(1)}%</span>;
    }},
    { key: 'priority', label: 'Priority', render: (a) => <StatusBadge value={a.mission?.priority} /> },
    { key: 'operator', label: 'Operator', render: (a) => operatorName(a.operator) },
    { key: 'assignmentStatus', label: 'Status', render: (a) => <StatusBadge value={a.assignmentStatus} /> },
    { key: 'action', label: '', render: (a) => a.assignmentStatus === 'RECOMMENDED' && <button className="btn btn-sm btn-outline-primary" disabled={busy === `assignment-${a.assignmentId}`} onClick={() => openAssignOperator(a)}><i className="bi bi-person-check" /> Assign Operator</button> },
  ];

  if (loading) return <Loader label="Loading assignment workflow" />;
  if (error) return <EmptyState icon="bi-wifi-off" title="Assignments could not load" message={error} action={<button className="btn btn-primary btn-sm" onClick={load}>Retry</button>} />;

  return <>
    <PageHeader eyebrow="INTELLIGENT DISPATCH" title="Assignment Engine" description="Match pending missions to the safest eligible aircraft, then assign an available operator." />
    <div className="engine-banner"><span><i className="bi bi-cpu-fill" /></span><div><strong>Vectra Recommendation Engine</strong><p>Evaluates reserve battery, mission distance, payload limits and active maintenance records.</p></div><small><i /> ONLINE</small></div>

    <section className="panel data-panel mt-4"><div className="panel-title"><div><span>READY FOR DISPATCH</span><h2>Pending missions</h2></div><span className="count-chip">{pending.length} waiting</span></div>
      <DataTable columns={pendingColumns} rows={pending} keyField="missionId" empty={{ icon: 'bi-check2-circle', title: 'Dispatch queue is clear', message: 'There are no pending missions to assign.' }} /></section>

    <section className="panel data-panel mt-4"><div className="panel-title"><div><span>ADMIN REVIEW</span><h2>Recommended assignments</h2></div><span className="count-chip">{recommended.length} recommended</span></div>
      <DataTable columns={assignmentColumns} rows={recommended} keyField="assignmentId" empty={{ icon: 'bi-stars', title: 'No recommended assignments', message: 'Run the assignment engine for a pending mission.' }} /></section>

    <section className="panel data-panel mt-4"><div className="panel-title"><div><span>ASSIGNMENT LEDGER</span><h2>All assignments</h2></div><span className="count-chip">{assignments.length} total</span></div>
      <DataTable columns={assignmentColumns} rows={assignments} keyField="assignmentId" empty={{ icon: 'bi-bezier2', title: 'No assignments yet', message: 'Assignments appear here after a mission receives a drone recommendation.' }} /></section>

    <Modal open={Boolean(assigning)} title={`Assign operator to ${assignmentCode(assigning?.assignmentId)}`} subtitle={`${missionCode(assigning?.mission?.missionId)} · ${assigning?.drone?.droneCode || 'Recommended drone'}`} onClose={() => setAssigning(null)}>
      <form onSubmit={submitOperator}>
        <label className="form-field"><span>Available operator</span>
          <select value={operatorId} onChange={(event) => setOperatorId(event.target.value)} disabled={submitting}>
            <option value="">Select operator</option>
            {availableOperators.map((operator) => <option key={operator.operatorId} value={operator.operatorId}>{operatorName(operator)} · {operator.licenseNumber}</option>)}
          </select>
        </label>
        <div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setAssigning(null)} disabled={submitting}>Cancel</button><button className="btn btn-primary" disabled={submitting || !operatorId}>{submitting ? 'Assigning…' : 'Assign operator'}</button></div>
      </form>
    </Modal>
  </>;
}
