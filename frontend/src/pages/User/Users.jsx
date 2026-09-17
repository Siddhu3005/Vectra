import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loader from '../../components/Loader';
import * as service from '../../services/userService';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Users() {
  const [users, setUsers] = useState([]), [loading, setLoading] = useState(true), [editing, setEditing] = useState(null), [viewing, setViewing] = useState(null), [deleting, setDeleting] = useState(null);
  const notify = useToast(); const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const load = () => service.getUsers().then(setUsers).catch((e) => notify(errorMessage(e), 'error')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const view = async (id) => { try { setViewing(await service.getUser(id)); } catch (e) { notify(errorMessage(e), 'error'); } };
  const open = (u) => { setEditing(u); reset({ ...u, password: '' }); };
  const save = async (data) => { try { await service.updateUser(editing.userId, data); notify('User updated'); setEditing(null); load(); } catch (e) { notify(errorMessage(e), 'error'); } };
  const deactivate = async () => { try { await service.deactivateUser(deleting.userId); notify('User deactivated'); setDeleting(null); load(); } catch (e) { notify(errorMessage(e), 'error'); } };
  if (loading) return <Loader label="Loading users" />;
  const columns = [
    { key: 'fullName', label: 'User', render: (u) => <div><strong>{u.fullName}</strong><small className="d-block text-secondary">{u.email}</small></div> },
    { key: 'phone', label: 'Phone' }, { key: 'role', label: 'Role', render: (u) => <StatusBadge value={u.role} /> },
    { key: 'active', label: 'State', render: (u) => <StatusBadge value={u.active ? 'ACTIVE' : 'INACTIVE'} /> },
    { key: 'actions', label: '', render: (u) => <div className="row-actions"><button onClick={() => view(u.userId)}><i className="bi bi-eye" /></button><button onClick={() => open(u)}><i className="bi bi-pencil" /></button><button className="danger" disabled={!u.active} onClick={() => setDeleting(u)}><i className="bi bi-person-x" /></button></div> },
  ];
  return <><PageHeader eyebrow="ACCESS CONTROL" title="User Management" description="Review identities, roles, and account access." />
    <section className="panel data-panel"><DataTable columns={columns} rows={users} keyField="userId" /></section>
    <Modal open={Boolean(editing)} title="Update user" subtitle="The backend requires a new password when updating an account." onClose={() => setEditing(null)}><form onSubmit={handleSubmit(save)}><div className="form-grid one">
      <label className="form-field"><span>Full name</span><input {...register('fullName', { required: true })} /></label><label className="form-field"><span>Email</span><input type="email" {...register('email', { required: true })} /></label>
      <label className="form-field"><span>Phone</span><input {...register('phone', { required: true })} /></label><label className="form-field"><span>Role</span><select {...register('role')}>{['ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR', 'MAINTENANCE_ENGINEER'].map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="form-field"><span>New password</span><input type="password" {...register('password', { required: true, minLength: 8 })} /></label>
    </div><div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" disabled={isSubmitting}>Update user</button></div></form></Modal>
    <Modal open={Boolean(viewing)} title="User details" onClose={() => setViewing(null)}><div className="detail-grid">{[['Name', viewing?.fullName], ['Email', viewing?.email], ['Phone', viewing?.phone], ['Role', viewing?.role], ['State', viewing?.active ? 'Active' : 'Inactive'], ['Created', viewing?.createdAt?.replace('T', ' ') || '—']].map(([l,v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div></Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Deactivate user" message={`Deactivate ${deleting?.fullName}? Their record will be retained.`} onCancel={() => setDeleting(null)} onConfirm={deactivate} />
  </>;
}
