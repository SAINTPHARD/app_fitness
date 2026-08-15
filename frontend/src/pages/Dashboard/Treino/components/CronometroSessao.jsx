import { Pause, Play } from 'lucide-react';
import { formatarDuracao } from '../hooks/useCronometro';

/**
 * Cronômetro geral da sessão — fica no cabeçalho, ao lado do status. Um
 * único botão alterna iniciar/pausar (o texto e o ícone deixam claro qual
 * ação ele dispara a seguir, em vez de dois botões competindo por espaço).
 */
export default function CronometroSessao({ segundos, rodando, aoIniciar, aoPausar, aoRetomar, jaComecou }) {
  const alternar = () => {
    if (rodando) {
      aoPausar();
    } else if (jaComecou) {
      aoRetomar();
    } else {
      aoIniciar();
    }
  };

  return (
    <div className="cronometroSessao">
      <span className="cronometroSessaoTempo" aria-live="off">
        {formatarDuracao(segundos)}
      </span>
      <button
        type="button"
        className="btnCronometroToggle"
        onClick={alternar}
        aria-label={rodando ? 'Pausar cronômetro do treino' : 'Iniciar cronômetro do treino'}
      >
        {rodando ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
        {rodando ? 'Pausar' : jaComecou ? 'Retomar' : 'Iniciar treino'}
      </button>
    </div>
  );
}
