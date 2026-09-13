import './button.css';
import PropTypes from 'prop-types';

export default function Button({ children, variant = 'primary', type = 'button', onClick, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${variant} ${disabled ? 'disabled' : ''}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = { children: PropTypes.node.isRequired, variant: PropTypes.string, type: PropTypes.string, onClick: PropTypes.func, disabled: PropTypes.bool };
