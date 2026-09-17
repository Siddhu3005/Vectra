import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="not-found"><span>404</span><i className="bi bi-airplane-engines" /><h1>Signal lost</h1><p>The airspace sector you requested could not be located on the command grid.</p><Link className="btn btn-primary" to="/dashboard">Return to command center</Link></div>;
}
