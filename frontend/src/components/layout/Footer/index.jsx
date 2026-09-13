import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, MoreHorizontal, Settings, TrendingUp, X } from 'lucide-react';
import './footer.css';

const links = [
  { label: 'Início', path: '/dashboard/inicio' },
  { label: 'Dieta', path: '/dashboard/dieta' },
  { label: 'Treino', path: '/dashboard/treino' },
  { label: 'Perfil', path: '/dashboard/perfil' },
];

const linksAdicionais = [
  { label: 'Evolução', path: '/dashboard/evolucao', icon: TrendingUp },
  { label: 'Relatórios', path: '/dashboard/relatorios', icon: BarChart3 },
  { label: 'Configurações', path: '/dashboard/configuracoes', icon: Settings },
];

export default function Footer() {
  const [menuMaisAberto, setMenuMaisAberto] = useState(false);
  const referenciaDialogo = useRef(null);
  const referenciaGatilho = useRef(null);
  const referenciaFechar = useRef(null);

  useEffect(() => {
    const consultaDesktop = window.matchMedia('(min-width: 768px)');
    const fecharNoDesktop = (evento) => {
      if (evento.matches) setMenuMaisAberto(false);
    };
    consultaDesktop.addEventListener('change', fecharNoDesktop);
    return () => consultaDesktop.removeEventListener('change', fecharNoDesktop);
  }, []);

  useEffect(() => {
    if (!menuMaisAberto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    const gatilho = referenciaGatilho.current;
    document.body.style.overflow = 'hidden';
    referenciaFechar.current?.focus();

    const lidarComTeclado = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        setMenuMaisAberto(false);
        return;
      }

      if (evento.key !== 'Tab') return;
      const focaveis = referenciaDialogo.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!focaveis?.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', lidarComTeclado);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', lidarComTeclado);
      gatilho?.focus();
    };
  }, [menuMaisAberto]);

  return (
    <>
      <footer className="footer" aria-label="Navegação inferior">
        {links.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `footerLink ${isActive ? 'footerLinkActive' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
        <button
          ref={referenciaGatilho}
          type="button"
          className="footerLink footerMoreButton"
          onClick={() => setMenuMaisAberto(true)}
          aria-haspopup="dialog"
          aria-expanded={menuMaisAberto}
        >
          <MoreHorizontal size={18} aria-hidden="true" />
          Mais
        </button>
      </footer>

      {menuMaisAberto && (
        <div className="moreOverlay" role="presentation" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setMenuMaisAberto(false);
        }}>
          <section
            ref={referenciaDialogo}
            className="moreDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mais-titulo"
          >
            <div className="moreHeader">
              <h2 id="mais-titulo">Mais opções</h2>
              <button ref={referenciaFechar} type="button" onClick={() => setMenuMaisAberto(false)} aria-label="Fechar mais opções">
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav className="moreLinks" aria-label="Outras áreas do aplicativo">
              {linksAdicionais.map(({ label, path, icon: Icone }) => (
                <NavLink key={path} to={path} onClick={() => setMenuMaisAberto(false)}>
                  <Icone size={20} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </section>
        </div>
      )}
    </>
  );
}
