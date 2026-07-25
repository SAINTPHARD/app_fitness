import './button.css';

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
