export default function Loading({ label = 'Loading…' }) {
  return <div className="loading" role="status">{label}</div>;
}
