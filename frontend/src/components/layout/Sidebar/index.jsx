import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Crown, Home, LogOut, Salad, Dumbbell, User, TrendingUp, BarChart3, Settings } from 'lucide-react';

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

export default function Sidebar({ onLogout }) {
  // Recolhida por padrão (só ícones); passar o mouse por cima expande
  // mostrando os rótulos, e volta a recolher ao tirar o mouse.
  const [expandido, setExpandido] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpandido(true)}
      onMouseLeave={() => setExpandido(false)}
      className={[
        // Contraste "Dual Theme": a sidebar é quase preta (zinc-900) para
        // criar profundidade contra a área de conteúdo, que é clara (slate-100).
        // `fixed` para poder expandir por cima do conteúdo sem empurrar o
        // layout — a área de conteúdo já reserva o espaço da largura recolhida.
        'fixed inset-y-4 left-4 z-40 flex flex-col gap-8 overflow-hidden rounded-3xl bg-zinc-900 p-4 text-zinc-100 shadow-xl shadow-slate-300/40 transition-[width] duration-200 ease-out',
        expandido ? 'w-72 p-6' : 'w-20',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-xl text-zinc-900">
          ⚡
        </span>
        <Rotulo expandido={expandido}>
          <strong className="block text-lg font-bold text-white">System Fitness</strong>
          <p className="m-0 text-base text-zinc-400">Seu treino diário</p>
        </Rotulo>
      </div>

      <nav className="grid gap-2" aria-label="Menu principal">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
              <Rotulo expandido={expandido}>{item.label}</Rotulo>
            </NavLink>
          );
        })}
      </nav>

      {/* Cartão "Upgrade to Pro": um segundo tom de escuro + borda sutil
          para parecer um elemento premium "flutuando" dentro da sidebar. */}
      <div className="mt-auto flex flex-col gap-3 rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-zinc-800 to-zinc-900 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-lime-400 text-zinc-900">
          <Crown size={18} strokeWidth={2.5} />
        </span>
        <Rotulo expandido={expandido} className="flex flex-col gap-3">
          <div>
            <p className="m-0 text-base font-bold text-white">Upgrade to Pro</p>
            <p className="m-0 mt-1 text-sm leading-relaxed text-zinc-400">
              Desbloqueie relatórios avançados e metas ilimitadas.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-lime-400 px-3 py-2 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Fazer upgrade
          </button>
        </Rotulo>
      </div>

      <button
        type="button"
        onClick={onLogout}
        title="Sair"
        className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-800 px-4 py-3 text-base font-bold text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
      >
        <LogOut size={18} strokeWidth={2.5} className="shrink-0" />
        <Rotulo expandido={expandido}>Sair</Rotulo>
      </button>
    </aside>
  );
}
