import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import TableToolbar from '../../components/TableToolbar';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import * as service from '../../services/maintenanceService';
import { getDrones } from '../../services/droneService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Maintenance() {
  const [records, setRecords] = useState([]), [drones, setDrones] = useState([]), [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false), [editing, setEditing] = useState(null), [history, setHistory] = useState(null), [search, setSearch] = useState(''), [filter, setFilter] = useState('');
  const notify = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const load = () => Promise.all([service.getMaintenance(), getDrones()]).then(([r, d]) => { setRecords(r); setDrones(d); }).catch((e) => notify(errorMessage(e), 'error')).finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const save = async (data) => {
    try { await service.createMaintenance({ ...data, droneId: Number(data.droneId) }); notify('Maintenance record created'); setOpen(false); reset(); load(); }
    catch (e) { notify(errorMessage(e), 'error'); }
  };
  const complete = async (id) => {
    try { await service.completeMaintenance(id); notify('Maintenance marked complete'); load(); }
    catch (e) { notify(errorMessage(e), 'error'); }
  };
  const edit = (record) => { setEditing(record); reset({ droneId: record.drone?.droneId, issue: record.issue, maintenanceType: record.maintenanceType, remarks: record.remarks || '' }); };
  const update = async (data) => { try { await service.updateMaintenance(editing.maintenanceId, { ...data, droneId: Number(data.droneId) }); notify('Maintenance moved to in progress'); setEditing(null); reset(); load(); } catch (e) { notify(errorMessage(e), 'error'); } };
  const showHistory = async (record) => { try { setHistory({ drone: record.drone, records: await service.getMaintenanceHistory(record.drone.droneId) }); } catch (e) { notify(errorMessage(e), 'error'); } };
  const filtered = useMemo(() => records.filter((r) => (!filter || r.status === filter) && [r.issue, r.maintenanceType, r.drone?.droneCode].some((x) => x?.toLowerCase().includes(search.toLowerCase()))), [records, search, filter]);
  const columns = [
    { key: 'maintenanceId', label: 'Work order', render: (r) => <strong>MNT-{String(r.maintenanceId).padStart(4, '0')}</strong> },
    { key: 'drone', label: 'Aircraft', render: (r) => <div className="record-id"><span><i className="bi bi-tools" /></span><div><strong>{r.drone?.droneCode}</strong><small>{r.drone?.model}</small></div></div> },
    { key: 'issue', label: 'Issue' }, { key: 'maintenanceType', label: 'Type' },
    { key: 'startDate', label: 'Opened', render: (r) => r.startDate || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'actions', label: '', render: (r) => <div className="d-flex gap-1"><button className="btn btn-sm btn-light" onClick={() => showHistory(r)} title="Drone history"><i className="bi bi-clock-history" /></button>{r.status !== 'COMPLETED' && <><button className="btn btn-sm btn-outline-primary" onClick={() => edit(r)}><i className="bi bi-play" /> Start / edit</button><button className="btn btn-sm btn-outline-success" onClick={() => complete(r.maintenanceId)}><i className="bi bi-check2" /> Complete</button></>}</div> },
  ];
  if (loading) return <Loader label="Loading maintenance history" />;
  return <>
    <PageHeader eyebrow="AIRWORTHINESS" title="Maintenance" description="Track inspections, repairs and scheduled service across the fleet."
      action={<button className="btn btn-primary app-button" onClick={() => setOpen(true)}><i className="bi bi-plus-lg" /> New work order</button>} />
    <div className="mini-stats"><div><span className="orange"><i className="bi bi-hourglass-split" /></span><p>Pending<strong>{records.filter((r) => r.status === 'PENDING').length}</strong></p></div>
      <div><span className="blue"><i className="bi bi-gear-wide-connected" /></span><p>In progress<strong>{records.filter((r) => r.status === 'IN_PROGRESS').length}</strong></p></div>
      <div><span className="green"><i className="bi bi-check2-circle" /></span><p>Completed<strong>{records.filter((r) => r.status === 'COMPLETED').length}</strong></p></div></div>
    <section className="panel data-panel"><TableToolbar search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={['PENDING', 'IN_PROGRESS', 'COMPLETED']} placeholder="Search aircraft, issue or type…" />
      <DataTable columns={columns} rows={filtered} keyField="maintenanceId" empty={{ icon: 'bi-tools', title: 'No maintenance records' }} /></section>
    <Modal open={open} title="Create work order" subtitle="Place an aircraft into maintenance and document the issue." onClose={() => setOpen(false)}>
      <form onSubmit={handleSubmit(save)}><div className="form-grid one">
        <label className="form-field"><span>Aircraft</span><select {...register('droneId', { required: true })}><option value="">Select aircraft</option>{drones.map((d) => <option value={d.droneId} key={d.droneId}>{d.droneCode} · {d.model}</option>)}</select>{errors.droneId && <small>Select an aircraft.</small>}</label>
        <label className="form-field"><span>Maintenance type</span><input placeholder="Scheduled inspection" {...register('maintenanceType', { required: true })} />{errors.maintenanceType && <small>Type is required.</small>}</label>
        <label className="form-field"><span>Issue</span><textarea rows="3" placeholder="Describe the fault or required service…" {...register('issue', { required: true })} />{errors.issue && <small>Issue is required.</small>}</label>
        <label className="form-field"><span>Remarks</span><textarea rows="2" {...register('remarks')} /></label>
      </div><div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={isSubmitting}>Create work order</button></div></form>
    </Modal>
    <Modal open={Boolean(editing)} title="Update work order" subtitle="Saving marks this maintenance record in progress." onClose={() => setEditing(null)}>
      <form onSubmit={handleSubmit(update)}><input type="hidden" {...register('droneId')} /><div className="form-grid one">
        <label className="form-field"><span>Maintenance type</span><input {...register('maintenanceType', { required: true })} /></label>
        <label className="form-field"><span>Issue</span><textarea rows="3" {...register('issue', { required: true })} /></label>
        <label className="form-field"><span>Remarks</span><textarea rows="2" {...register('remarks')} /></label>
      </div><div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" disabled={isSubmitting}>Save and start</button></div></form>
    </Modal>
    <Modal open={Boolean(history)} title={`${history?.drone?.droneCode || ''} maintenance history`} onClose={() => setHistory(null)} size="modal-lg">
      <DataTable columns={columns.slice(0, 6)} rows={history?.records || []} keyField="maintenanceId" empty={{ icon: 'bi-clock-history', title: 'No history' }} />
    </Modal>
  </>;
}
