import './input.css';
import PropTypes from 'prop-types';

export default function Input({ label, error, ...props }) {
  return (
    <label className="wrapper">
      {label && <span className="label">{label}</span>}
      <input className={`input ${error ? 'errorInput' : ''}`} {...props} />
      {error && <span className="error">{error}</span>}
    </label>
  );
}

Input.propTypes = { label: PropTypes.node, error: PropTypes.node };
