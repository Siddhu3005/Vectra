import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="topbar-clock">
      <i className="bi bi-clock" />
      <span>{time} UTC+5:30</span>
    </div>
  );
}

export default function Navbar({ onMenu }) {
  const { user } = useAuth();
  const initials = user?.fullName?.split(' ').map((x) => x[0]).slice(0, 2).join('') || 'VC';

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenu} aria-label="Open menu">
        <i className="bi bi-list" />
      </button>
      <div className="topbar-context">
        <span>Mission Control</span>
        <strong>Aerial Operations</strong>
      </div>
      <LiveClock />
      <div className="topbar-actions">
        <div className="fleet-pulse">
          <i /><span>FLEET ACTIVE</span>
        </div>
        <button className="notification-btn" aria-label="Notifications">
          <i className="bi bi-bell" /><span />
        </button>
        <Link to="/profile" className="user-chip">
          <span className="avatar">{initials}</span>
          <span>
            <strong>{user?.fullName}</strong>
            <small>{user?.role?.replaceAll('_', ' ')}</small>
          </span>
          <i className="bi bi-chevron-down" />
        </Link>
      </div>
    </header>
  );
}
