import { NavLink } from 'react-router-dom';
import './footer.css';

const links = [
  { label: 'Início', path: '/dashboard/inicio' },
  { label: 'Dieta', path: '/dashboard/dieta' },
  { label: 'Treino', path: '/dashboard/treino' },
  { label: 'Perfil', path: '/dashboard/perfil' },
];

export default function Footer() {
  return (
    <footer className="footer">
      {links.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `link ${isActive ? 'active' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </footer>
  );
}
