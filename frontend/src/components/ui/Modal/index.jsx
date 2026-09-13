import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './modal.css';

export default function Modal({ title, open, onClose, children }) {
  if (!open) return null;

  return createPortal(
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="header">
          <strong>{title}</strong>
          <button type="button" onClick={onClose} className="closeButton">
            ✕
          </button>
        </header>
        <div className="body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

Modal.propTypes = { title: PropTypes.node.isRequired, open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, children: PropTypes.node.isRequired };
