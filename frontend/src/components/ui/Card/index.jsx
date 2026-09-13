import './card.css';
import PropTypes from 'prop-types';

export default function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

Card.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
