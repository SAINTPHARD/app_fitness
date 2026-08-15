import { Award, CheckCircle2, Clock, Dumbbell, TrendingUp, X } from 'lucide-react';
import { formatarDuracao } from '../hooks/useCronometro';

function formatarKg(valor) {
  if (valor === null || valor === undefined) return '—';
  return `${Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
}

/**
 * Resumo exibido depois de encerrar o treino (ou ao pedir uma prévia antes
 * de confirmar, via `somenteVisualizacao`). Todos os números vêm prontos do
 * backend (`GET /sessoes/{id}/resumo`) — nada é recalculado aqui, pra não
 * arriscar o resumo divergir do que foi realmente persistido.
 */
export default function ResumoTreinoModal({ resumo, aoFechar }) {
  if (!resumo) return null;

  const diferencaVolume =
    resumo.volumeSessaoAnterior != null && resumo.volumeTotal != null
      ? resumo.volumeTotal - resumo.volumeSessaoAnterior
      : null;
  const percentualVolume =
    diferencaVolume != null && resumo.volumeSessaoAnterior > 0
      ? Math.round((diferencaVolume / resumo.volumeSessaoAnterior) * 100)
      : null;

  return (
    <div className="modalOverlay">
      <div className="modalCatalogo modalResumo">
        <div className="modalHeader">
          <h3>Treino encerrado 🎉</h3>
          <button className="btnClose" onClick={aoFechar} aria-label="Fechar resumo">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="resumoGradeMetricas">
          <div className="resumoMetrica">
            <Clock size={18} strokeWidth={2.5} />
            <strong>{formatarDuracao(resumo.tempoTotalSegundos)}</strong>
            <span>Tempo total</span>
          </div>
          <div className="resumoMetrica">
            <CheckCircle2 size={18} strokeWidth={2.5} />
            <strong>
              {resumo.exerciciosConcluidos}/{resumo.exerciciosTotal}
            </strong>
            <span>Exercícios concluídos</span>
          </div>
          <div className="resumoMetrica">
            <Dumbbell size={18} strokeWidth={2.5} />
            <strong>
              {resumo.seriesRealizadas}/{resumo.seriesTotal}
            </strong>
            <span>Séries realizadas</span>
          </div>
          <div className="resumoMetrica">
            <TrendingUp size={18} strokeWidth={2.5} />
            <strong>{formatarKg(resumo.volumeTotal)}</strong>
            <span>Volume total</span>
          </div>
        </div>

        {resumo.maiorCarga != null && (
          <p className="resumoLinha">
            Maior carga do treino: <strong>{formatarKg(resumo.maiorCarga)}</strong>
          </p>
        )}

        {diferencaVolume != null && (
          <p className="resumoLinha">
            Comparado ao treino anterior:{' '}
            <strong className={diferencaVolume >= 0 ? 'resumoPositivo' : 'resumoNegativo'}>
              {diferencaVolume >= 0 ? '+' : ''}
              {formatarKg(diferencaVolume)}
              {percentualVolume != null && ` (${diferencaVolume >= 0 ? '+' : ''}${percentualVolume}%)`}
            </strong>
          </p>
        )}

        {resumo.novosRecordes?.length > 0 && (
          <div className="resumoSecao resumoRecordes">
            <h4>
              <Award size={16} strokeWidth={2.5} /> Novos recordes pessoais
            </h4>
            <ul>
              {resumo.novosRecordes.map((recorde) => (
                <li key={recorde.exercicioId}>
                  <strong>{recorde.nomeExercicio}</strong>: {formatarKg(recorde.cargaNova)}
                  {recorde.cargaAnterior != null && <> (antes: {formatarKg(recorde.cargaAnterior)})</>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {resumo.exerciciosNaoConcluidos?.length > 0 && (
          <div className="resumoSecao">
            <h4>Ficaram pendentes</h4>
            <ul className="resumoPendentesLista">
              {resumo.exerciciosNaoConcluidos.map((item) => (
                <li key={item.exercicioId}>
                  {item.nome} — {item.seriesConcluidas}/{item.seriesTotal} séries
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className="btnPrincipal btnResumoFechar" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </div>
  );
}
