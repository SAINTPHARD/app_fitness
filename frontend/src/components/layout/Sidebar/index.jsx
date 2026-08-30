import { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Home, LogOut, Salad, Dumbbell, User, TrendingUp, BarChart3, Settings, X, Zap } from 'lucide-react';

const navigation = [
  { label: 'Início', path: '/dashboard/inicio', icon: Home },
  { label: 'Dieta', path: '/dashboard/dieta', icon: Salad },
  { label: 'Treino', path: '/dashboard/treino', icon: Dumbbell },
  { label: 'Evolução', path: '/dashboard/evolucao', icon: TrendingUp },
  { label: 'Relatórios', path: '/dashboard/relatorios', icon: BarChart3 },
  { label: 'Perfil', path: '/dashboard/perfil', icon: User },
  { label: 'Configurações', path: '/dashboard/configuracoes', icon: Settings },
];

// Rótulo que só aparece com a sidebar expandida — some encolhendo a
// própria largura (max-w + opacity) em vez de só um `hidden`, para a
// transição de abrir/fechar ficar suave em vez de um corte seco.
function Rotulo({ expandido, className = '', children }) {
  return (
    <span
      className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${expandido ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'} ${className}`}
    >
      {children}
    </span>
  );
}

Rotulo.propTypes = {
  expandido: PropTypes.bool.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default function Sidebar({ onLogout, abertoNoMobile = false, aoFecharNoMobile }) {
  // Recolhida por padrão (só ícones); passar o mouse por cima expande
  // mostrando os rótulos, e volta a recolher ao tirar o mouse.
  const [expandido, setExpandido] = useState(false);

  return (
    <>
      {abertoNoMobile && <button type="button" className="fixed inset-0 z-40 bg-zinc-950/55 backdrop-blur-sm md:hidden" onClick={aoFecharNoMobile} aria-label="Fechar menu" />}
    <aside
      onMouseEnter={() => setExpandido(true)}
      onMouseLeave={() => setExpandido(false)}
      className={[
        // Contraste "Dual Theme": a sidebar é quase preta (zinc-900) para
        // criar profundidade contra a área de conteúdo, que é clara (slate-100).
        // `fixed` para poder expandir por cima do conteúdo sem empurrar o
        // layout — a área de conteúdo já reserva o espaço da largura recolhida.
        'fixed inset-y-3 left-3 z-50 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col gap-6 overflow-hidden rounded-3xl bg-zinc-900 p-5 text-zinc-100 shadow-xl shadow-slate-300/40 transition-transform duration-200 ease-out md:inset-y-4 md:left-4 md:gap-8 md:transition-[width]',
        abertoNoMobile ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)] md:translate-x-0',
        expandido ? 'md:w-72 md:p-6' : 'md:w-20 md:p-4',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-xl text-zinc-900">
          <Zap size={22} strokeWidth={2.8} aria-hidden="true" />
        </span>
        <Rotulo expandido={abertoNoMobile || expandido}>
          <strong className="block text-lg font-bold text-white">System Fitness</strong>
          <p className="m-0 text-base text-zinc-400">Seu treino diário</p>
        </Rotulo>
        <button type="button" onClick={aoFecharNoMobile} className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-zinc-300 hover:bg-zinc-800 md:hidden" aria-label="Fechar menu"><X size={22} /></button>
      </div>

      <nav className="grid gap-2" aria-label="Menu principal">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={aoFecharNoMobile}
              title={item.label}
              className={({ isActive }) =>
                // Item ativo em verde-lima néon com texto escuro para máximo contraste;
                // itens inativos permanecem discretos até o hover.
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-colors',
                  isActive
                    ? 'bg-lime-400 text-zinc-900'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
                ].join(' ')
              }
            >
              <Icon size={20} strokeWidth={2.5} className="shrink-0" />
              <Rotulo expandido={abertoNoMobile || expandido}>{item.label}</Rotulo>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        title="Sair"
        className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-zinc-800 px-4 py-3 text-base font-bold text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
      >
        <LogOut size={18} strokeWidth={2.5} className="shrink-0" />
        <Rotulo expandido={abertoNoMobile || expandido}>Sair</Rotulo>
      </button>
    </aside>
    </>
  );
}

Sidebar.propTypes = {
  onLogout: PropTypes.func.isRequired,
  abertoNoMobile: PropTypes.bool,
  aoFecharNoMobile: PropTypes.func.isRequired,
};
