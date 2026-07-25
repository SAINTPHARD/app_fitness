import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, Droplet, LogOut, Moon, Plus, Scale, Settings, Sun, User as UserIcon } from 'lucide-react';
import { useTema } from '../../../hooks/useTema';
import { obterFraseMotivacionalDoDia, obterSaudacaoPorHorario } from './frasesMotivacionais';
import './header.css';

// Atalhos rápidos do Header: navegação direta para as ações mais comuns do
// dia a dia, sem precisar abrir o menu e procurar a página certa.
const ATALHOS_RAPIDOS = [
  { rotulo: 'Registrar água', destino: '/dashboard/dieta', icone: Droplet },
  { rotulo: 'Atualizar peso', destino: '/dashboard/perfil', icone: Scale },
  { rotulo: 'Nova refeição', destino: '/dashboard/dieta', icone: Plus },
];

/**
 * Fecha um menu suspenso ao clicar fora dele. Reaproveitado pelo dropdown de
 * notificações e pelo dropdown do usuário — os dois têm o mesmo
 * comportamento de "clique fora fecha".
 */
function useFecharAoClicarFora(aberto, aoFechar) {
  const referenciaContainer = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    function lidarComCliqueFora(evento) {
      if (referenciaContainer.current && !referenciaContainer.current.contains(evento.target)) {
        aoFechar();
      }
    }

    document.addEventListener('mousedown', lidarComCliqueFora);
    return () => document.removeEventListener('mousedown', lidarComCliqueFora);
  }, [aberto, aoFechar]);

  return referenciaContainer;
}

export default function Header({ user, onLogout }) {
  const { ehEscuro, alternarTema } = useTema();
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);

  const refNotificacoes = useFecharAoClicarFora(notificacoesAbertas, () => setNotificacoesAbertas(false));
  const refMenuUsuario = useFecharAoClicarFora(menuUsuarioAberto, () => setMenuUsuarioAberto(false));

  const nomeUsuario = user?.email?.split('@')[0] || 'Atleta';

  return (
    <header className="header">
      <div>
        <p className="greeting">
          {obterSaudacaoPorHorario()}, {nomeUsuario} 👋
        </p>
        <p className="motivationalPhrase">{obterFraseMotivacionalDoDia()}</p>
      </div>

      <div className="headerActions">
        {/* Atalhos rápidos: navegação direta para água/peso/nova refeição —
            evita ter que procurar a página certa no menu. */}
        <div className="quickActions">
          {ATALHOS_RAPIDOS.map(({ rotulo, destino, icone: Icone }) => (
            <Link key={rotulo} to={destino} className="iconButton" title={rotulo} aria-label={rotulo}>
              <Icone size={17} strokeWidth={2} />
            </Link>
          ))}
        </div>

        {/* Notificações: sem backend de notificações ainda, então o painel
            mostra um estado vazio honesto em vez de itens inventados. */}
        <div className="dropdownContainer" ref={refNotificacoes}>
          <button
            type="button"
            className="iconButton"
            onClick={() => setNotificacoesAbertas((prev) => !prev)}
            aria-label="Notificações"
            aria-expanded={notificacoesAbertas}
          >
            <Bell size={18} strokeWidth={2} />
          </button>
          {notificacoesAbertas && (
            <div className="dropdownPanel">
              <p className="dropdownTitle">Notificações</p>
              <p className="dropdownEmpty">Nenhuma notificação por enquanto.</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="iconButton"
          onClick={alternarTema}
          aria-label={ehEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {ehEscuro ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>

        <div className="dropdownContainer" ref={refMenuUsuario}>
          <button
            type="button"
            className="profileCard"
            onClick={() => setMenuUsuarioAberto((prev) => !prev)}
            aria-expanded={menuUsuarioAberto}
          >
            <span className="profileAvatar">{user?.email?.charAt(0)?.toUpperCase() || 'A'}</span>
            <div>
              <strong>{nomeUsuario}</strong>
              <p>Plano ativo</p>
            </div>
            <ChevronDown size={16} strokeWidth={2.5} className="profileChevron" />
          </button>

          {menuUsuarioAberto && (
            <div className="dropdownPanel">
              <Link to="/dashboard/perfil" className="dropdownItem" onClick={() => setMenuUsuarioAberto(false)}>
                <UserIcon size={15} strokeWidth={2.5} /> Perfil
              </Link>
              <Link to="/dashboard/configuracoes" className="dropdownItem" onClick={() => setMenuUsuarioAberto(false)}>
                <Settings size={15} strokeWidth={2.5} /> Configurações
              </Link>
              <button type="button" className="dropdownItem dropdownItemDanger" onClick={onLogout}>
                <LogOut size={15} strokeWidth={2.5} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
