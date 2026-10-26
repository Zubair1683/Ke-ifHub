// Label + input pair used by all forms
export default function Field({ label, id, children, hint }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </div>
  );
}
