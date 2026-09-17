import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { getDashboard } from '../../services/dashboardService';
import { getMissions, startMission, completeMission } from '../../services/missionService';
import { getMaintenance } from '../../services/maintenanceService';
import { getMyMissions } from '../../services/assignmentService';
import { getMyProfile } from '../../services/operatorService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
const cards = [
  ['totalDrones', 'Total drones', 'bi-airplane-engines', 'blue'],
  ['available', 'Available', 'bi-check2-circle', 'green'],
  ['charging', 'Charging', 'bi-lightning-charge', 'cyan'],
  ['maintenance', 'Maintenance', 'bi-tools', 'orange'],
  ['offline', 'Offline', 'bi-power', 'gray'],
  ['todaysMissions', "Today's missions", 'bi-signpost-2', 'violet'],
  ['completedMissions', 'Completed', 'bi-check2-all', 'green'],
  ['pendingMissions', 'Pending', 'bi-hourglass-split', 'orange'],
];

export default function Dashboard() {
  const [state, setState] = useState({ stats: {}, missions: [], maintenance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const notify = useToast();
  const { user } = useAuth();

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      if (user?.role === 'OPERATOR') {
        await getMyProfile().catch(() => {});
        setState({ stats: {}, missions: await getMyMissions(), maintenance: [] });
        return;
      }
      if (user?.role === 'WAREHOUSE_MANAGER') {
        setState({ stats: {}, missions: await getMissions(), maintenance: [] });
        return;
      }
      const canViewMaintenance = ['ADMIN', 'MAINTENANCE_ENGINEER'].includes(user?.role);
      const requests = [getDashboard(), getMissions()];
      if (canViewMaintenance) requests.push(getMaintenance());
      const results = await Promise.allSettled(requests);
      const [statsResult, missionsResult, maintenanceResult] = results;
      setState({
        stats: statsResult.status === 'fulfilled' ? statsResult.value : {},
        missions: missionsResult.status === 'fulfilled' ? missionsResult.value : [],
        maintenance: maintenanceResult?.status === 'fulfilled' ? maintenanceResult.value : [],
      });
      const rejected = results.find((result) => result.status === 'rejected');
      if (rejected) notify(errorMessage(rejected.reason), 'error');
    } catch (e) {
      const message = errorMessage(e);
      setError(message);
      notify(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.role]);

  if (loading) return <Loader />;
  if (error) return <EmptyState icon="bi-wifi-off" title="Dashboard could not load" message={error} action={<button className="btn btn-primary btn-sm" onClick={loadDashboard}>Retry</button>} />;
  if (user?.role === 'OPERATOR') return <OperatorDashboard missions={Array.isArray(state.missions) ? state.missions : []} onRefresh={loadDashboard} />;
  if (user?.role === 'WAREHOUSE_MANAGER') return <WarehouseManagerDashboard missions={Array.isArray(state.missions) ? state.missions : []} onRefresh={loadDashboard} />;
  if (user?.role === 'MAINTENANCE_ENGINEER') return <MaintenanceEngineerDashboard stats={state.stats || {}} maintenance={Array.isArray(state.maintenance) ? state.maintenance : []} onRefresh={loadDashboard} />;

  const stats = state.stats || {};
  const missions = Array.isArray(state.missions) ? state.missions : [];
  const maintenance = Array.isArray(state.maintenance) ? state.maintenance : [];
  const pie = { labels: ['Available', 'Charging', 'Maintenance', 'Offline'], datasets: [{ data: [stats.available, stats.charging, stats.maintenance, stats.offline], backgroundColor: ['#34d399', '#22d3ee', '#fbbf24', '#64748b'], borderWidth: 0, spacing: 4 }] };
  const bar = { labels: ['Pending', 'Assigned', 'In progress', 'Completed'], datasets: [{ label: 'Missions', data: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((s) => missions.filter((m) => m.missionStatus === s).length), backgroundColor: ['#fbbf24', '#3b82f6', '#22d3ee', '#34d399'], borderRadius: 8, barThickness: 26 }] };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, color: '#64748b' }, grid: { color: 'rgba(56, 189, 248, 0.08)' } },
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
    },
  };
  const missionColumns = [
    { key: 'missionId', label: 'Mission', render: (r) => <strong>MSN-{String(r.missionId).padStart(4, '0')}</strong> },
    { key: 'route', label: 'Route', render: (r) => <span>{r.pickupLocation} <i className="bi bi-arrow-right mx-1" /> {r.destination}</span> },
    { key: 'priority', label: 'Priority', render: (r) => <StatusBadge value={r.priority} /> },
    { key: 'missionStatus', label: 'Status', render: (r) => <StatusBadge value={r.missionStatus} /> },
  ];
  const maintenanceColumns = [
    { key: 'maintenanceId', label: 'Record', render: (r) => <strong>MNT-{String(r.maintenanceId).padStart(4, '0')}</strong> },
    { key: 'drone', label: 'Drone', render: (r) => r.drone?.droneCode || '—' },
    { key: 'issue', label: 'Issue' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <>
    <PageHeader eyebrow="MISSION CONTROL" title="Fleet Operations Center" description="Real-time aerial fleet telemetry, mission readiness, and operational intelligence." />
    <div className="stats-grid">{cards.map(([key, label, icon, tone]) => <div className="stat-card" key={key}>
      <span className={`stat-icon ${tone}`}><i className={`bi ${icon}`} /></span><div><span>{label}</span><strong>{stats[key] ?? 0}</strong></div>
      <small><i className="bi bi-activity" /> Live</small></div>)}</div>
    <div className="dashboard-grid mt-4">
      <section className="panel"><div className="panel-title"><div><span>FLEET HEALTH</span><h2>Drone status</h2></div><i className="bi bi-three-dots" /></div><div className="chart-box donut"><Doughnut data={pie} options={{ ...chartOptions, cutout: '72%', scales: undefined }} /></div></section>
      <section className="panel wide"><div className="panel-title"><div><span>MISSION FLOW</span><h2>Mission status</h2></div><span className="period-chip">Current workload</span></div><div className="chart-box"><Bar data={bar} options={chartOptions} /></div></section>
    </div>
    <div className="dashboard-grid tables mt-4">
      <section className="panel wide"><div className="panel-title"><div><span>LATEST ACTIVITY</span><h2>Recent missions</h2></div></div><DataTable columns={missionColumns} rows={missions.slice(-5).reverse()} keyField="missionId" /></section>
      {['ADMIN', 'MAINTENANCE_ENGINEER'].includes(user?.role) ? (
        <section className="panel"><div className="panel-title"><div><span>SERVICE QUEUE</span><h2>Recent maintenance</h2></div></div><DataTable columns={maintenanceColumns} rows={maintenance.slice(-5).reverse()} keyField="maintenanceId" /></section>
      ) : (
        <section className="panel access-panel"><i className="bi bi-shield-lock" /><h2>Maintenance workspace</h2><p>Maintenance records are restricted to administrators and maintenance engineers.</p></section>
      )}
    </div>
  </>;
}

function OperatorDashboard({ missions, onRefresh }) {
  const [viewing, setViewing] = useState(null);
  const [actionBusy, setActionBusy] = useState('');
  const notify = useToast();

  const runAction = async (action, missionId) => {
    setActionBusy(`${action}-${missionId}`);
    try {
      const updated = action === 'start' ? await startMission(missionId) : await completeMission(missionId);
      if (viewing?.missionId === missionId) setViewing(updated);
      notify(action === 'start' ? 'Mission started' : 'Mission completed successfully');
      await onRefresh();
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setActionBusy('');
    }
  };

  const active = missions.filter((m) => ['ASSIGNED', 'IN_PROGRESS'].includes(m.missionStatus));
  const history = missions.filter((m) => !['ASSIGNED', 'IN_PROGRESS'].includes(m.missionStatus));

  const actionCol = (mission) => {
    const busy = actionBusy === `start-${mission.missionId}` || actionBusy === `complete-${mission.missionId}`;
    if (mission.missionStatus === 'ASSIGNED') return <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => runAction('start', mission.missionId)}><i className="bi bi-play-fill" /> {busy ? 'Starting…' : 'Start'}</button>;
    if (mission.missionStatus === 'IN_PROGRESS') return <button className="btn btn-sm btn-success" disabled={busy} onClick={() => runAction('complete', mission.missionId)}><i className="bi bi-check2-circle" /> {busy ? 'Completing…' : 'Complete'}</button>;
    return null;
  };

  const columns = [
    { key: 'missionId', label: 'Mission', render: (m) => <button className="btn btn-link p-0 text-start" onClick={() => setViewing(m)}><strong>MSN-{String(m.missionId).padStart(4, '0')}</strong></button> },
    { key: 'route', label: 'Route', render: (m) => <span>{m.pickupLocation} <i className="bi bi-arrow-right mx-1" /> {m.destination}</span> },
    { key: 'drone', label: 'Drone', render: (m) => droneLabel(m) },
    { key: 'missionStatus', label: 'Status', render: (m) => <StatusBadge value={m.missionStatus} /> },
    { key: 'priority', label: 'Priority', render: (m) => <StatusBadge value={m.priority} /> },
    { key: 'action', label: '', render: actionCol },
  ];
  const histCols = [
    { key: 'missionId', label: 'Mission', render: (m) => <strong>MSN-{String(m.missionId).padStart(4, '0')}</strong> },
    { key: 'route', label: 'Route', render: (m) => `${m.pickupLocation} → ${m.destination}` },
    { key: 'missionStatus', label: 'Status', render: (m) => <StatusBadge value={m.missionStatus} /> },
    { key: 'endTime', label: 'Completed', render: (m) => formatDateTime(m.endTime) },
  ];

  return <>
    <PageHeader eyebrow="OPERATOR DASHBOARD" title="My Missions" description="Your active queue and mission history." />
    <div className="mini-stats">
      <div><span className="blue"><i className="bi bi-hourglass-split" /></span><p>Assigned<strong>{missions.filter((m) => m.missionStatus === 'ASSIGNED').length}</strong></p></div>
      <div><span className="cyan"><i className="bi bi-play-circle" /></span><p>In Progress<strong>{missions.filter((m) => m.missionStatus === 'IN_PROGRESS').length}</strong></p></div>
      <div><span className="green"><i className="bi bi-check2-all" /></span><p>Completed<strong>{missions.filter((m) => m.missionStatus === 'COMPLETED').length}</strong></p></div>
    </div>
    {active.length > 0 && <section className="panel data-panel mb-4">
      <div className="panel-title"><div><span>ACTIVE QUEUE</span><h2>Current &amp; assigned missions</h2></div><span className="count-chip">{active.length} active</span></div>
      <DataTable columns={columns} rows={active} keyField="missionId" empty={{ icon: 'bi-person-check', title: 'No active missions' }} />
    </section>}
    <section className="panel data-panel">
      <div className="panel-title"><div><span>MISSION HISTORY</span><h2>Past missions</h2></div></div>
      <DataTable columns={histCols} rows={history} keyField="missionId" empty={{ icon: 'bi-clock-history', title: 'No mission history yet', message: 'Completed missions will appear here.' }} />
    </section>
    <Modal open={Boolean(viewing)} title={`MSN-${String(viewing?.missionId || '').padStart(4, '0')}`} subtitle={`${viewing?.pickupLocation || ''} → ${viewing?.destination || ''}`} onClose={() => setViewing(null)} size="modal-lg">
      <MissionStepper status={viewing?.missionStatus} />
      <div className="detail-grid mt-4">
        <Detail label="Type" value={viewing?.missionType} /><Detail label="Priority" value={viewing?.priority} />
        <Detail label="Status" value={<StatusBadge value={viewing?.missionStatus} />} /><Detail label="Payload" value={`${viewing?.packageWeight} kg`} />
        <Detail label="Total distance" value={`${viewing?.totalDistance} km`} /><Detail label="Battery required" value={`${viewing?.estimatedBatteryRequired?.toFixed?.(1) ?? 0}%`} />
        <Detail label="Start time" value={formatDateTime(viewing?.startTime)} /><Detail label="End time" value={formatDateTime(viewing?.endTime)} />
      </div>
      {['ASSIGNED', 'IN_PROGRESS'].includes(viewing?.missionStatus) && (
        <div className="modal-actions">
          {viewing?.missionStatus === 'ASSIGNED' && <button className="btn btn-primary" disabled={Boolean(actionBusy)} onClick={() => runAction('start', viewing.missionId)}><i className="bi bi-play-fill" /> {actionBusy ? 'Starting…' : 'Start Mission'}</button>}
          {viewing?.missionStatus === 'IN_PROGRESS' && <button className="btn btn-success" disabled={Boolean(actionBusy)} onClick={() => runAction('complete', viewing.missionId)}><i className="bi bi-check2-circle" /> {actionBusy ? 'Completing…' : 'Complete Mission'}</button>}
        </div>
      )}
    </Modal>
  </>;
}

function WarehouseManagerDashboard({ missions, onRefresh }) {
  const [viewing, setViewing] = useState(null);
  const pending = missions.filter((m) => m.missionStatus === 'PENDING');
  const inFlight = missions.filter((m) => ['ASSIGNED', 'IN_PROGRESS', 'RECOMMENDED'].includes(m.missionStatus));
  const completed = missions.filter((m) => m.missionStatus === 'COMPLETED');
  const columns = [
    { key: 'missionId', label: 'Mission', render: (m) => <button className="btn btn-link p-0" onClick={() => setViewing(m)}><strong>MSN-{String(m.missionId).padStart(4, '0')}</strong></button> },
    { key: 'route', label: 'Route', render: (m) => <span>{m.pickupLocation} <i className="bi bi-arrow-right mx-1" /> {m.destination}</span> },
    { key: 'missionType', label: 'Type' },
    { key: 'priority', label: 'Priority', render: (m) => <StatusBadge value={m.priority} /> },
    { key: 'missionStatus', label: 'Status', render: (m) => <StatusBadge value={m.missionStatus} /> },
    { key: 'createdAt', label: 'Created', render: (m) => formatDateTime(m.createdAt) },
  ];
  return <>
    <PageHeader eyebrow="WAREHOUSE OPERATIONS" title="Mission Overview" description="Track all missions you have dispatched." />
    <div className="mini-stats">
      <div><span className="orange"><i className="bi bi-hourglass-split" /></span><p>Pending<strong>{pending.length}</strong></p></div>
      <div><span className="blue"><i className="bi bi-send" /></span><p>In Flight<strong>{inFlight.length}</strong></p></div>
      <div><span className="green"><i className="bi bi-check2-all" /></span><p>Completed<strong>{completed.length}</strong></p></div>
    </div>
    <section className="panel data-panel">
      <div className="panel-title"><div><span>MISSION TRACKER</span><h2>All missions</h2></div><span className="count-chip">{missions.length} total</span></div>
      <DataTable columns={columns} rows={missions} keyField="missionId" empty={{ icon: 'bi-map', title: 'No missions yet', message: 'Create a mission from the Missions page.' }} />
    </section>
    <Modal open={Boolean(viewing)} title={`MSN-${String(viewing?.missionId || '').padStart(4, '0')}`} subtitle={`${viewing?.pickupLocation || ''} → ${viewing?.destination || ''}`} onClose={() => setViewing(null)} size="modal-lg">
      <MissionStepper status={viewing?.missionStatus} />
      <div className="detail-grid mt-4">
        <Detail label="Type" value={viewing?.missionType} /><Detail label="Priority" value={viewing?.priority} />
        <Detail label="Status" value={<StatusBadge value={viewing?.missionStatus} />} /><Detail label="Payload" value={`${viewing?.packageWeight} kg`} />
        <Detail label="Total distance" value={`${viewing?.totalDistance} km`} /><Detail label="Battery required" value={`${viewing?.estimatedBatteryRequired?.toFixed?.(1) ?? 0}%`} />
        <Detail label="Start time" value={formatDateTime(viewing?.startTime)} /><Detail label="End time" value={formatDateTime(viewing?.endTime)} />
      </div>
    </Modal>
  </>;
}

function MaintenanceEngineerDashboard({ stats, maintenance, onRefresh }) {
  const pending = maintenance.filter((r) => r.status === 'PENDING');
  const inProgress = maintenance.filter((r) => r.status === 'IN_PROGRESS');
  const completed = maintenance.filter((r) => r.status === 'COMPLETED');
  const notify = useToast();
  const [busy, setBusy] = useState(null);
  const { getMaintenance: refreshMaint } = {};

  const complete = async (id) => {
    setBusy(id);
    try {
      const { completeMaintenance } = await import('../../services/maintenanceService');
      await completeMaintenance(id);
      notify('Maintenance marked complete');
      await onRefresh();
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    { key: 'maintenanceId', label: 'Work order', render: (r) => <strong>MNT-{String(r.maintenanceId).padStart(4, '0')}</strong> },
    { key: 'drone', label: 'Aircraft', render: (r) => <div className="record-id"><span><i className="bi bi-tools" /></span><div><strong>{r.drone?.droneCode}</strong><small>{r.drone?.model}</small></div></div> },
    { key: 'issue', label: 'Issue' },
    { key: 'maintenanceType', label: 'Type' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'action', label: '', render: (r) => r.status !== 'COMPLETED' && <button className="btn btn-sm btn-outline-success" disabled={busy === r.maintenanceId} onClick={() => complete(r.maintenanceId)}><i className="bi bi-check2" /> {busy === r.maintenanceId ? 'Saving…' : 'Complete'}</button> },
  ];
  return <>
    <PageHeader eyebrow="MAINTENANCE ENGINEER" title="Maintenance Dashboard" description="Service queue and airworthiness status across the fleet." />
    <div className="mini-stats">
      <div><span className="orange"><i className="bi bi-hourglass-split" /></span><p>Pending<strong>{pending.length}</strong></p></div>
      <div><span className="blue"><i className="bi bi-gear-wide-connected" /></span><p>In Progress<strong>{inProgress.length}</strong></p></div>
      <div><span className="green"><i className="bi bi-check2-circle" /></span><p>Completed<strong>{completed.length}</strong></p></div>
    </div>
    <section className="panel data-panel mt-2">
      <div className="panel-title"><div><span>SERVICE QUEUE</span><h2>Pending &amp; in-progress work orders</h2></div><span className="count-chip">{pending.length + inProgress.length} open</span></div>
      <DataTable columns={columns} rows={[...pending, ...inProgress]} keyField="maintenanceId" empty={{ icon: 'bi-check2-circle', title: 'No open work orders', message: 'All aircraft are airworthy.' }} />
    </section>
    <section className="panel data-panel mt-4">
      <div className="panel-title"><div><span>HISTORY</span><h2>Completed maintenance</h2></div></div>
      <DataTable columns={columns.slice(0, 5)} rows={completed.slice(-10).reverse()} keyField="maintenanceId" empty={{ icon: 'bi-clock-history', title: 'No completed records yet' }} />
    </section>
  </>;
}

function droneLabel(mission) {
  const drone = mission.drone || mission.assignment?.drone;
  if (!drone) return '—';
  return <div className="record-id"><span><i className="bi bi-airplane-engines" /></span><div><strong>{drone.droneCode}</strong><small>{drone.model}</small></div></div>;
}
function formatDateTime(value) { return value ? String(value).replace('T', ' ') : '—'; }
function Detail({ label, value }) { return <div><span>{label}</span><strong>{value || '—'}</strong></div>; }
function MissionStepper({ status }) {
  const steps = ['PENDING', 'RECOMMENDED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
  const order = { PENDING: 0, RECOMMENDED: 1, ASSIGNED: 2, IN_PROGRESS: 3, COMPLETED: 4, FAILED: 4 };
  const current = order[status] ?? steps.indexOf(status);
  return <div className="mission-stepper">{steps.map((step, i) => <div className={i <= current ? 'done' : ''} key={step}><span>{i < current ? <i className="bi bi-check-lg" /> : i + 1}</span><small>{step.replaceAll('_', ' ')}</small></div>)}</div>;
}
