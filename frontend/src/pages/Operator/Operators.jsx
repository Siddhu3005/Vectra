import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loader from '../../components/Loader';
import * as operatorsApi from '../../services/operatorService';
import { getUsers } from '../../services/userService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const blank = { userId: '', licenseNumber: '', certification: '', availabilityStatus: 'AVAILABLE', experienceYears: 0 };
export default function Operators() {
  const [operators, setOperators] = useState([]), [users, setUsers] = useState([]), [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null), [viewing, setViewing] = useState(null), [deleting, setDeleting] = useState(null);
  const notify = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: blank });
  const load = async () => {
    try { const [o, u] = await Promise.all([operatorsApi.getOperators(), getUsers()]); setOperators(o); setUsers(u); }
    catch (e) { notify(errorMessage(e), 'error'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const open = (item = {}) => { setEditing(item); reset({ ...blank, ...item, userId: item.user?.userId || '' }); };
  const view = async (id) => { try { setViewing(await operatorsApi.getOperator(id)); } catch (e) { notify(errorMessage(e), 'error'); } };
  const save = async (data) => {
    const payload = { ...data, userId: Number(data.userId), experienceYears: Number(data.experienceYears) };
    try { editing?.operatorId ? await operatorsApi.updateOperator(editing.operatorId, payload) : await operatorsApi.createOperator(payload); notify('Operator saved'); setEditing(null); load(); }
    catch (e) { notify(errorMessage(e), 'error'); }
  };
  const remove = async () => { try { await operatorsApi.deleteOperator(deleting.operatorId); notify('Operator removed'); setDeleting(null); load(); } catch (e) { notify(errorMessage(e), 'error'); } };
  if (loading) return <Loader label="Loading operators" />;
  const columns = [
    { key: 'operatorId', label: 'Operator', render: (o) => <strong>OPR-{String(o.operatorId).padStart(4, '0')}</strong> },
    { key: 'user', label: 'Identity', render: (o) => <div><strong>{o.user?.fullName}</strong><small className="d-block text-secondary">{o.user?.email}</small></div> },
    { key: 'licenseNumber', label: 'License' }, { key: 'certification', label: 'Certification' },
    { key: 'experienceYears', label: 'Experience', render: (o) => `${o.experienceYears} years` },
    { key: 'availabilityStatus', label: 'Status', render: (o) => <StatusBadge value={o.availabilityStatus} /> },
    { key: 'actions', label: '', render: (o) => <div className="row-actions"><button onClick={() => view(o.operatorId)}><i className="bi bi-eye" /></button><button onClick={() => open(o)}><i className="bi bi-pencil" /></button><button className="danger" onClick={() => setDeleting(o)}><i className="bi bi-trash3" /></button></div> },
  ];
  return <>
    <PageHeader eyebrow="WORKFORCE" title="Operator Management" description="Manage licensed flight personnel and operational availability." action={<button className="btn btn-primary app-button" onClick={() => open()}><i className="bi bi-plus-lg" /> Add operator</button>} />
    <section className="panel data-panel"><DataTable columns={columns} rows={operators} keyField="operatorId" empty={{ icon: 'bi-people', title: 'No operators registered' }} /></section>
    <Modal open={editing !== null} title={editing?.operatorId ? 'Edit operator' : 'Create operator'} onClose={() => setEditing(null)}>
      <form onSubmit={handleSubmit(save)}><div className="form-grid one">
        <Field label="Operator user" error={errors.userId}><select {...register('userId', { required: true })}><option value="">Select user</option>{users.filter((u) => u.role === 'OPERATOR' && u.active !== false).map((u) => <option key={u.userId} value={u.userId}>{u.fullName} · {u.email}</option>)}</select></Field>
        <Field label="License number" error={errors.licenseNumber}><input {...register('licenseNumber', { required: true })} /></Field>
        <Field label="Certification"><input {...register('certification')} /></Field>
        <Field label="Availability"><select {...register('availabilityStatus', { required: true })}>{['AVAILABLE', 'ASSIGNED', 'ON_LEAVE', 'INACTIVE'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Experience (years)"><input type="number" min="0" {...register('experienceYears', { valueAsNumber: true, min: 0 })} /></Field>
      </div><div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" disabled={isSubmitting}>Save operator</button></div></form>
    </Modal>
    <Modal open={Boolean(viewing)} title="Operator details" onClose={() => setViewing(null)}><div className="detail-grid"><Detail label="Name" value={viewing?.user?.fullName} /><Detail label="Email" value={viewing?.user?.email} /><Detail label="License" value={viewing?.licenseNumber} /><Detail label="Certification" value={viewing?.certification || '—'} /><Detail label="Availability" value={viewing?.availabilityStatus} /><Detail label="Total missions" value={viewing?.totalMissions ?? 0} /></div></Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Remove operator" message={`Remove ${deleting?.user?.fullName} from the operator registry?`} onCancel={() => setDeleting(null)} onConfirm={remove} />
  </>;
}
function Field({ label, error, children }) { return <label className="form-field"><span>{label}</span>{children}{error && <small>Required field.</small>}</label>; }
function Detail({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
