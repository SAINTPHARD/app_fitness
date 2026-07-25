import './input.css';

export default function Input({ label, error, ...props }) {
  return (
    <label className="wrapper">
      {label && <span className="label">{label}</span>}
      <input className={`input ${error ? 'errorInput' : ''}`} {...props} />
      {error && <span className="error">{error}</span>}
    </label>
  );
}
