import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['Dashboard', '/dashboard', 'bi-radar', null],
  ['Drones', '/drones', 'bi-airplane-engines-fill', ['ADMIN', 'MAINTENANCE_ENGINEER']],
  ['Missions', '/missions', 'bi-signpost-split-fill', ['ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR']],
  ['Assignments', '/assignments', 'bi-bezier2', ['ADMIN']],
  ['Operators', '/operators', 'bi-people-fill', ['ADMIN']],
  ['Users', '/users', 'bi-person-badge-fill', ['ADMIN']],
  ['Maintenance', '/maintenance', 'bi-tools', ['ADMIN', 'MAINTENANCE_ENGINEER']],
  ['Reports', '/reports', 'bi-bar-chart-fill', ['ADMIN']],
  ['Profile', '/profile', 'bi-person-circle', null],
];

export default function Sidebar({ open, onClose }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const logout = () => { signOut(); navigate('/login'); };

  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><i className="bi bi-airplane-engines-fill" /></span>
          <div>
            <strong>VECTRA</strong>
            <small>Aerial Fleet Command</small>
          </div>
        </div>
        <div className="nav-caption">NAVIGATION</div>
        <nav>
          {links.filter(([, , , roles]) => !roles || roles.includes(user?.role)).map(([label, path, icon]) => (
            <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}>
              <i className={`bi ${icon}`} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="system-status">
            <span />
            <div>
              <strong>Fleet systems online</strong>
              <small>API · SECURE LINK</small>
            </div>
          </div>
          <button onClick={logout}><i className="bi bi-box-arrow-left" /> Sign out</button>
        </div>
      </aside>
    </>
  );
}
