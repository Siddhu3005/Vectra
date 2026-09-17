import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { getMissions } from '../../services/missionService';
import { getDrones } from '../../services/droneService';
import { getMaintenance } from '../../services/maintenanceService';
import { getOperators } from '../../services/operatorService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0, color: '#64748b' }, grid: { color: 'rgba(56, 189, 248, 0.08)' } },
    x: { ticks: { color: '#64748b' }, grid: { display: false } },
  },
};

export default function Reports() {
  const [data, setData] = useState({ missions: [], drones: [], maintenance: [], operators: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('missions');
  const notify = useToast();

  useEffect(() => {
    Promise.all([getMissions(), getDrones(), getMaintenance(), getOperators()])
      .then(([missions, drones, maintenance, operators]) => setData({ missions, drones, maintenance, operators }))
      .catch((e) => notify(errorMessage(e), 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Preparing reports" />;

  const { missions, drones, maintenance, operators } = data;
  const completed = missions.filter((m) => m.missionStatus === 'COMPLETED');
  const completionRate = missions.length ? Math.round((completed.length / missions.length) * 100) : 0;
  const totalBatteryUsed = completed.reduce((sum, m) => sum + (m.estimatedBatteryRequired || 0), 0);
  const avgBattery = completed.length ? (totalBatteryUsed / completed.length).toFixed(1) : 0;

  return <>
    <PageHeader eyebrow="OPERATIONAL INTELLIGENCE" title="Reports" description="Live summaries derived from mission, fleet, and maintenance records."
      action={<button className="btn btn-outline-secondary app-button" onClick={() => exportCSV(data)}><i className="bi bi-download" /> Export CSV</button>} />

    <div className="mini-stats four">
      <Metric icon="bi-signpost" label="Total missions" value={missions.length} tone="blue" />
      <Metric icon="bi-check2-circle" label="Completion rate" value={`${completionRate}%`} tone="green" />
      <Metric icon="bi-lightning-charge" label="Avg battery / mission" value={`${avgBattery}%`} tone="cyan" />
      <Metric icon="bi-tools" label="Open maintenance" value={maintenance.filter((m) => m.status !== 'COMPLETED').length} tone="orange" />
    </div>

    <div className="report-tabs mb-4">
      {[['missions', 'Mission Report'], ['drones', 'Drone Utilization'], ['battery', 'Battery Consumption'], ['operators', 'Operator Performance'], ['maintenance', 'Maintenance History']].map(([key, label]) => (
        <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
      ))}
    </div>

    {tab === 'missions' && <MissionReport missions={missions} />}
    {tab === 'drones' && <DroneUtilization drones={drones} missions={missions} />}
    {tab === 'battery' && <BatteryReport drones={drones} missions={missions} />}
    {tab === 'operators' && <OperatorPerformance operators={operators} />}
    {tab === 'maintenance' && <MaintenanceReport maintenance={maintenance} />}
  </>;
}

function MissionReport({ missions }) {
  const statusCounts = ['PENDING', 'RECOMMENDED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'].map((s) => missions.filter((m) => m.missionStatus === s).length);
  const typeCounts = ['DELIVERY', 'MEDICAL', 'INSPECTION', 'SURVEILLANCE', 'AGRICULTURE'].map((t) => missions.filter((m) => m.missionType === t).length);
  const bar = { labels: ['Pending', 'Recommended', 'Assigned', 'In Progress', 'Completed', 'Failed', 'Cancelled'], datasets: [{ label: 'Missions', data: statusCounts, backgroundColor: ['#fbbf24', '#3b82f6', '#60a5fa', '#22d3ee', '#34d399', '#f87171', '#64748b'], borderRadius: 8, barThickness: 22 }] };
  const pie = { labels: ['Delivery', 'Medical', 'Inspection', 'Surveillance', 'Agriculture'], datasets: [{ data: typeCounts, backgroundColor: ['#3b82f6', '#34d399', '#fbbf24', '#22d3ee', '#a78bfa'], borderWidth: 0, spacing: 4 }] };
  const cols = [
    { key: 'missionId', label: 'Mission', render: (m) => <strong>MSN-{String(m.missionId).padStart(4, '0')}</strong> },
    { key: 'missionType', label: 'Type' },
    { key: 'route', label: 'Route', render: (m) => `${m.pickupLocation} → ${m.destination}` },
    { key: 'totalDistance', label: 'Distance', render: (m) => `${Number(m.totalDistance || 0).toFixed(1)} km` },
    { key: 'estimatedBatteryRequired', label: 'Battery used', render: (m) => `${Number(m.estimatedBatteryRequired || 0).toFixed(1)}%` },
    { key: 'priority', label: 'Priority', render: (m) => <StatusBadge value={m.priority} /> },
    { key: 'missionStatus', label: 'Status', render: (m) => <StatusBadge value={m.missionStatus} /> },
  ];
  return <>
    <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <section className="panel"><div className="panel-title"><div><span>BY STATUS</span><h2>Mission status breakdown</h2></div></div><div className="chart-box"><Bar data={bar} options={chartOpts} /></div></section>
      <section className="panel"><div className="panel-title"><div><span>BY TYPE</span><h2>Mission type distribution</h2></div></div><div className="chart-box donut"><Doughnut data={pie} options={{ ...chartOpts, cutout: '68%', scales: undefined }} /></div></section>
    </div>
    <section className="panel data-panel"><div className="panel-title"><div><span>MISSION LEDGER</span><h2>All missions</h2></div><span className="count-chip">{missions.length} total</span></div>
      <DataTable columns={cols} rows={missions} keyField="missionId" empty={{ icon: 'bi-map', title: 'No missions found' }} /></section>
  </>;
}

function DroneUtilization({ drones, missions }) {
  const completed = missions.filter((m) => m.missionStatus === 'COMPLETED');
  const statusCounts = ['AVAILABLE', 'IN_MISSION', 'CHARGING', 'MAINTENANCE', 'OFFLINE'].map((s) => drones.filter((d) => d.status === s).length);
  const bar = { labels: ['Available', 'In Mission', 'Charging', 'Maintenance', 'Offline'], datasets: [{ label: 'Drones', data: statusCounts, backgroundColor: ['#34d399', '#22d3ee', '#3b82f6', '#fbbf24', '#64748b'], borderRadius: 8, barThickness: 28 }] };
  const cols = [
    { key: 'droneCode', label: 'Aircraft', render: (d) => <div className="record-id"><span><i className="bi bi-airplane-engines" /></span><div><strong>{d.droneCode}</strong><small>{d.model}</small></div></div> },
    { key: 'status', label: 'Status', render: (d) => <StatusBadge value={d.status} /> },
    { key: 'flightCount', label: 'Total flights', render: (d) => <strong>{d.flightCount}</strong> },
    { key: 'batteryPercentage', label: 'Battery', render: (d) => <div className="battery-cell"><span>{Math.round(d.batteryPercentage)}%</span><div><i style={{ width: `${d.batteryPercentage}%` }} className={d.batteryPercentage < d.minimumReserve ? 'low' : ''} /></div></div> },
    { key: 'payloadCapacity', label: 'Payload cap.', render: (d) => `${d.payloadCapacity} kg` },
    { key: 'currentLocation', label: 'Location' },
  ];
  return <>
    <section className="panel mb-4"><div className="panel-title"><div><span>FLEET STATUS</span><h2>Drone status distribution</h2></div></div><div className="chart-box" style={{ height: 220 }}><Bar data={bar} options={chartOpts} /></div></section>
    <section className="panel data-panel"><div className="panel-title"><div><span>FLEET REGISTRY</span><h2>All aircraft</h2></div><span className="count-chip">{drones.length} registered</span></div>
      <DataTable columns={cols} rows={drones} keyField="droneId" empty={{ icon: 'bi-airplane', title: 'No drones registered' }} /></section>
  </>;
}

function BatteryReport({ drones, missions }) {
  const completed = missions.filter((m) => m.missionStatus === 'COMPLETED' && m.estimatedBatteryRequired > 0);
  const top10 = [...completed].sort((a, b) => b.estimatedBatteryRequired - a.estimatedBatteryRequired).slice(0, 10);
  const bar = { labels: top10.map((m) => `MSN-${String(m.missionId).padStart(4, '0')}`), datasets: [{ label: 'Battery used (%)', data: top10.map((m) => Number(m.estimatedBatteryRequired).toFixed(1)), backgroundColor: '#22d3ee', borderRadius: 8, barThickness: 22 }] };
  const lowBattery = drones.filter((d) => d.batteryPercentage < d.minimumReserve);
  const cols = [
    { key: 'missionId', label: 'Mission', render: (m) => <strong>MSN-{String(m.missionId).padStart(4, '0')}</strong> },
    { key: 'route', label: 'Route', render: (m) => `${m.pickupLocation} → ${m.destination}` },
    { key: 'totalDistance', label: 'Distance', render: (m) => `${Number(m.totalDistance || 0).toFixed(1)} km` },
    { key: 'estimatedBatteryRequired', label: 'Battery consumed', render: (m) => <span className="status-badge status-warning">{Number(m.estimatedBatteryRequired).toFixed(1)}%</span> },
    { key: 'missionStatus', label: 'Status', render: (m) => <StatusBadge value={m.missionStatus} /> },
  ];
  return <>
    {top10.length > 0 && <section className="panel mb-4"><div className="panel-title"><div><span>TOP CONSUMERS</span><h2>Highest battery usage (top 10 missions)</h2></div></div><div className="chart-box" style={{ height: 220 }}><Bar data={bar} options={chartOpts} /></div></section>}
    {lowBattery.length > 0 && <section className="panel data-panel mb-4"><div className="panel-title"><div><span className="text-danger">⚠ LOW BATTERY ALERT</span><h2>Drones below minimum reserve</h2></div><span className="count-chip status-danger">{lowBattery.length} drones</span></div>
      <DataTable columns={[{ key: 'droneCode', label: 'Drone', render: (d) => <strong>{d.droneCode}</strong> }, { key: 'batteryPercentage', label: 'Current battery', render: (d) => <span className="status-badge status-danger">{Math.round(d.batteryPercentage)}%</span> }, { key: 'minimumReserve', label: 'Min reserve', render: (d) => `${d.minimumReserve}%` }, { key: 'status', label: 'Status', render: (d) => <StatusBadge value={d.status} /> }]} rows={lowBattery} keyField="droneId" empty={{ icon: 'bi-battery', title: 'All drones above reserve' }} /></section>}
    <section className="panel data-panel"><div className="panel-title"><div><span>CONSUMPTION LOG</span><h2>Battery usage per completed mission</h2></div></div>
      <DataTable columns={cols} rows={completed} keyField="missionId" empty={{ icon: 'bi-lightning', title: 'No completed missions yet' }} /></section>
  </>;
}

function OperatorPerformance({ operators }) {
  const sorted = [...operators].sort((a, b) => b.totalMissions - a.totalMissions);
  const bar = { labels: sorted.slice(0, 10).map((o) => o.user?.fullName || o.licenseNumber), datasets: [{ label: 'Missions completed', data: sorted.slice(0, 10).map((o) => o.totalMissions), backgroundColor: '#34d399', borderRadius: 8, barThickness: 22 }] };
  const cols = [
    { key: 'operatorId', label: 'Operator', render: (o) => <div><strong>{o.user?.fullName || '—'}</strong><small className="d-block text-muted">{o.licenseNumber}</small></div> },
    { key: 'certification', label: 'Certification', render: (o) => o.certification || '—' },
    { key: 'experienceYears', label: 'Experience', render: (o) => `${o.experienceYears} yrs` },
    { key: 'totalMissions', label: 'Total missions', render: (o) => <strong>{o.totalMissions}</strong> },
    { key: 'availabilityStatus', label: 'Status', render: (o) => <StatusBadge value={o.availabilityStatus} /> },
  ];
  return <>
    {sorted.length > 0 && <section className="panel mb-4"><div className="panel-title"><div><span>LEADERBOARD</span><h2>Missions per operator</h2></div></div><div className="chart-box" style={{ height: 220 }}><Bar data={bar} options={chartOpts} /></div></section>}
    <section className="panel data-panel"><div className="panel-title"><div><span>WORKFORCE</span><h2>Operator performance</h2></div><span className="count-chip">{operators.length} operators</span></div>
      <DataTable columns={cols} rows={sorted} keyField="operatorId" empty={{ icon: 'bi-people', title: 'No operators registered' }} /></section>
  </>;
}

function MaintenanceReport({ maintenance }) {
  const statusCounts = ['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => maintenance.filter((r) => r.status === s).length);
  const pie = { labels: ['Pending', 'In Progress', 'Completed'], datasets: [{ data: statusCounts, backgroundColor: ['#fbbf24', '#3b82f6', '#34d399'], borderWidth: 0, spacing: 4 }] };
  const cols = [
    { key: 'maintenanceId', label: 'Work order', render: (r) => <strong>MNT-{String(r.maintenanceId).padStart(4, '0')}</strong> },
    { key: 'drone', label: 'Aircraft', render: (r) => r.drone?.droneCode || '—' },
    { key: 'maintenanceType', label: 'Type' },
    { key: 'issue', label: 'Issue' },
    { key: 'startDate', label: 'Date', render: (r) => r.startDate || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <>
    <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
      <section className="panel"><div className="panel-title"><div><span>OVERVIEW</span><h2>Maintenance status</h2></div></div><div className="chart-box donut"><Doughnut data={pie} options={{ ...chartOpts, cutout: '68%', scales: undefined }} /></div></section>
      <section className="panel"><div className="panel-title"><div><span>SUMMARY</span><h2>Maintenance metrics</h2></div></div>
        <div className="detail-grid" style={{ padding: 20 }}>
          <div><span>TOTAL RECORDS</span><strong>{maintenance.length}</strong></div>
          <div><span>PENDING</span><strong>{statusCounts[0]}</strong></div>
          <div><span>IN PROGRESS</span><strong>{statusCounts[1]}</strong></div>
          <div><span>COMPLETED</span><strong>{statusCounts[2]}</strong></div>
        </div>
      </section>
    </div>
    <section className="panel data-panel"><div className="panel-title"><div><span>MAINTENANCE LEDGER</span><h2>All work orders</h2></div><span className="count-chip">{maintenance.length} records</span></div>
      <DataTable columns={cols} rows={maintenance} keyField="maintenanceId" empty={{ icon: 'bi-tools', title: 'No maintenance records' }} /></section>
  </>;
}

function Metric({ icon, label, value, tone = 'blue' }) {
  return <div><span className={tone}><i className={`bi ${icon}`} /></span><p>{label}<strong>{value}</strong></p></div>;
}

function exportCSV({ missions, drones, maintenance, operators }) {
  const sections = [
    ['MISSIONS', ['ID', 'Type', 'Pickup', 'Destination', 'Distance (km)', 'Battery Used (%)', 'Priority', 'Status', 'Start Time', 'End Time'],
      missions.map((m) => [
        `MSN-${String(m.missionId).padStart(4, '0')}`, m.missionType, m.pickupLocation, m.destination,
        Number(m.totalDistance || 0).toFixed(1), Number(m.estimatedBatteryRequired || 0).toFixed(1),
        m.priority, m.missionStatus, m.startTime || '', m.endTime || '',
      ])],
    ['DRONES', ['Code', 'Model', 'Serial', 'Battery (%)', 'Flight Count', 'Payload (kg)', 'Location', 'Status'],
      drones.map((d) => [d.droneCode, d.model, d.serialNumber, Math.round(d.batteryPercentage), d.flightCount, d.payloadCapacity, d.currentLocation, d.status])],
    ['OPERATORS', ['Name', 'License', 'Certification', 'Experience (yrs)', 'Total Missions', 'Status'],
      operators.map((o) => [o.user?.fullName || '', o.licenseNumber, o.certification || '', o.experienceYears, o.totalMissions, o.availabilityStatus])],
    ['MAINTENANCE', ['Work Order', 'Drone', 'Type', 'Issue', 'Date', 'Status'],
      maintenance.map((r) => [`MNT-${String(r.maintenanceId).padStart(4, '0')}`, r.drone?.droneCode || '', r.maintenanceType, r.issue, r.startDate || '', r.status])],
  ];

  const rows = [];
  sections.forEach(([title, headers, data]) => {
    rows.push([title], headers, ...data, []);
  });

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vectra-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
