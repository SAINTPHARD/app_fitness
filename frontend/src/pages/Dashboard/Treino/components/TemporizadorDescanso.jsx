import { Minus, Pause, Play, Plus, RotateCcw, X } from 'lucide-react';
import { DURACOES_PADRAO_SEGUNDOS } from '../hooks/useTemporizadorDescanso';

function formatarMMSS(totalSegundos) {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

/**
 * Painel do descanso entre séries. Quando `finalizado`, o card pulsa
 * (`temporizadorFinalizado`) como alternativa visual sempre presente ao som
 * e à vibração — que são best-effort e podem estar indisponíveis (aba em
 * segundo plano, navegador sem suporte, som do sistema mudo). A contagem
 * fica numa região `aria-live` para leitores de tela acompanharem sem
 * precisar focar no elemento.
 */
export default function TemporizadorDescanso({ temporizador }) {
  const { ativo, rodando, finalizado, duracaoTotal, restante, iniciar, pausar, retomar, reiniciar, concluir, adicionarTempo, removerTempo } =
    temporizador;

  if (!ativo) {
    return (
      <div className="painelDescansoInativo">
        <span>Descanso:</span>
        {DURACOES_PADRAO_SEGUNDOS.map((segundos) => (
          <button key={segundos} type="button" className="btnDescansoPreset" onClick={() => iniciar(segundos)}>
            {segundos}s
          </button>
        ))}
      </div>
    );
  }

  const percentual = duracaoTotal > 0 ? Math.max(0, Math.min(100, (restante / duracaoTotal) * 100)) : 0;

  return (
    <div className={`painelDescanso ${finalizado ? 'temporizadorFinalizado' : ''}`} role="status">
      <div className="painelDescansoTopo">
        <span className="painelDescansoLabel">{finalizado ? 'Descanso concluído!' : 'Descanso'}</span>
        <button type="button" className="btnFecharDescanso" onClick={concluir} aria-label="Fechar temporizador de descanso">
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="barraDescanso">
        <div className="barraDescansoPreenchida" style={{ width: `${percentual}%` }} />
      </div>

      <p className="painelDescansoTempo" aria-live="polite">
        {formatarMMSS(restante)}
      </p>

      <div className="painelDescansoControles">
        <button type="button" onClick={removerTempo} aria-label="Remover 15 segundos" disabled={finalizado}>
          <Minus size={14} strokeWidth={2.5} /> 15s
        </button>

        {finalizado ? (
          <button type="button" className="btnDescansoPrincipal" onClick={reiniciar} aria-label="Repetir descanso">
            <RotateCcw size={16} strokeWidth={2.5} /> Repetir
          </button>
        ) : (
          <button
            type="button"
            className="btnDescansoPrincipal"
            onClick={rodando ? pausar : retomar}
            aria-label={rodando ? 'Pausar descanso' : 'Retomar descanso'}
          >
            {rodando ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
            {rodando ? 'Pausar' : 'Retomar'}
          </button>
        )}

        <button type="button" onClick={adicionarTempo} aria-label="Adicionar 15 segundos" disabled={finalizado}>
          <Plus size={14} strokeWidth={2.5} /> 15s
        </button>
      </div>
    </div>
  );
}
