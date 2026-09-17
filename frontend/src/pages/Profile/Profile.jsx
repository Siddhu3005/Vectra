import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
export default function Profile() {
  const { user, signOut } = useAuth(); const navigate = useNavigate();
  const logout = () => { signOut(); navigate('/login'); };
  const initials = user?.fullName?.split(' ').map((x) => x[0]).join('').slice(0, 2);
  return <>
    <PageHeader eyebrow="ACCOUNT & ACCESS" title="Your Profile" description="Review your identity and workspace authorization." />
    <div className="profile-grid"><section className="panel profile-card"><div className="profile-avatar">{initials}</div><h2>{user?.fullName}</h2><p>{user?.email}</p><StatusRole role={user?.role} /></section>
      <section className="panel profile-details"><div className="panel-title"><div><span>IDENTITY</span><h2>Account details</h2></div></div>
        <div className="detail-list"><div><i className="bi bi-person" /><span>Full name</span><strong>{user?.fullName}</strong></div><div><i className="bi bi-envelope" /><span>Email address</span><strong>{user?.email}</strong></div><div><i className="bi bi-shield-lock" /><span>Access role</span><strong>{user?.role?.replaceAll('_', ' ')}</strong></div><div><i className="bi bi-check-circle" /><span>Account state</span><strong className="text-success">Active</strong></div></div>
        <div className="security-box"><i className="bi bi-shield-check" /><div><strong>Secure session</strong><p>Your access is protected by JWT authentication and role-based authorization.</p></div></div>
        <button className="btn btn-outline-danger" onClick={logout}><i className="bi bi-box-arrow-left" /> Sign out of Vectra</button>
      </section></div>
  </>;
}
function StatusRole({ role }) { return <span className="role-pill"><i className="bi bi-shield-fill-check" /> {role?.replaceAll('_', ' ')}</span>; }
