export default function Loader({ label = 'Loading workspace' }) {
  return <div className="loader-wrap"><div className="spinner-border text-primary" role="status" /><span>{label}</span></div>;
}
