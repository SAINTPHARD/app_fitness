import { useEffect, useState } from 'react';
import { ChevronDown, Check, Minus, Plus, Trash2, X } from 'lucide-react';
import { fitnessApi } from '../../../../services/fitnessApi';
import { obterErroSerie } from '../utils/validarSerie';

const PASSO_CARGA = 2.5;
const PASSO_REPS = 1;

function numeroOuNull(valor) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

/**
 * Uma linha de série: número, carga e repetições editáveis (com +/- e input
 * direto), status visual e ações de concluir/excluir. Cada série já vem
 * editável assim que é criada — não existe um "modo de edição" separado.
 */
function LinhaSerie({ serie, processando, aoAtualizar, aoConcluir, aoExcluir }) {
  const [carga, setCarga] = useState(serie.carga ?? '');
  const [repeticoes, setRepeticoes] = useState(serie.repeticoes ?? '');
  const concluida = serie.status === 'CONCLUIDA';
  const pendenteCriacao = String(serie.id).startsWith('temp-');
  const bloqueada = concluida || processando || pendenteCriacao;
  const erroPreenchimento = concluida ? null : obterErroSerie(carga, repeticoes);

  useEffect(() => {
    setCarga(serie.carga ?? '');
    setRepeticoes(serie.repeticoes ?? '');
  }, [serie.carga, serie.repeticoes]);

  const salvar = (novaCarga, novasRepeticoes) => {
    aoAtualizar(serie.id, {
      exercicioId: serie.exercicioId,
      carga: numeroOuNull(novaCarga),
      repeticoes: numeroOuNull(novasRepeticoes),
    });
  };

  const ajustarCarga = (delta) => {
    const atual = numeroOuNull(carga) ?? 0;
    const novo = Math.max(0, atual + delta);
    setCarga(novo);
    salvar(novo, repeticoes);
  };

  const ajustarReps = (delta) => {
    const atual = numeroOuNull(repeticoes) ?? 0;
    const novo = Math.max(0, atual + delta);
    setRepeticoes(novo);
    salvar(carga, novo);
  };

  return (
    <li className={`linhaSerie ${concluida ? 'linhaSerieConcluida' : ''}`}>
      <span className="serieNumero" aria-hidden="true">
        {serie.numeroSerie}
      </span>

      <div className="serieCampo">
        <span className="serieCampoLabel">Carga (kg)</span>
        <div className="serieCampoControles">
          <button type="button" onClick={() => ajustarCarga(-PASSO_CARGA)} disabled={bloqueada} aria-label="Diminuir carga">
            <Minus size={14} strokeWidth={3} />
          </button>
          <input
            type="number"
            inputMode="decimal"
            min="0.1"
            step="0.5"
            value={carga}
            disabled={bloqueada}
            onChange={(e) => setCarga(e.target.value)}
            onBlur={() => salvar(carga, repeticoes)}
            aria-label="Carga em quilogramas"
          />
          <button type="button" onClick={() => ajustarCarga(PASSO_CARGA)} disabled={bloqueada} aria-label="Aumentar carga">
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="serieCampo">
        <span className="serieCampoLabel">Repetições</span>
        <div className="serieCampoControles">
          <button type="button" onClick={() => ajustarReps(-PASSO_REPS)} disabled={bloqueada} aria-label="Diminuir repetições">
            <Minus size={14} strokeWidth={3} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={repeticoes}
            disabled={bloqueada}
            onChange={(e) => setRepeticoes(e.target.value)}
            onBlur={() => salvar(carga, repeticoes)}
            aria-label="Número de repetições"
          />
          <button type="button" onClick={() => ajustarReps(PASSO_REPS)} disabled={bloqueada} aria-label="Aumentar repetições">
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="serieAcoes">
        {erroPreenchimento && <span className="serieErro" role="alert">{erroPreenchimento}</span>}
        {serie.pendenteSincronizacao && (
          <span className="pillSincronizacao" title="Salva localmente, sincroniza quando a conexão voltar">
            {pendenteCriacao ? 'Offline' : 'Pendente'}
          </span>
        )}
        <button
          type="button"
          className={`btnConcluirSerie ${concluida ? 'ativo' : ''}`}
          onClick={() => aoConcluir(serie.id)}
          disabled={concluida || processando || pendenteCriacao || Boolean(erroPreenchimento)}
          aria-pressed={concluida}
          title={pendenteCriacao ? 'Aguarde a sincronização antes de concluir' : undefined}
        >
          <Check size={15} strokeWidth={3} />
          {concluida ? 'Concluída' : 'Concluir'}
        </button>
        <button
          type="button"
          className="btnExcluirSerie"
          onClick={() => aoExcluir(serie)}
          disabled={processando}
          aria-label={`Excluir série ${serie.numeroSerie}`}
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>
    </li>
  );
}

export default function CardExercicioExecucao({
  exercicio,
  seriesHoje,
  processando,
  expandidoInicialmente,
  aoAdicionarSerie,
  aoAtualizarSerie,
  aoConcluirSerie,
  aoExcluirSerie,
  aoRemover,
}) {
  const [expandido, setExpandido] = useState(Boolean(expandidoInicialmente));
  const [sugestao, setSugestao] = useState(null);
  const [buscandoSugestao, setBuscandoSugestao] = useState(false);

  const seriesConcluidas = seriesHoje.filter((serie) => serie.status === 'CONCLUIDA').length;
  const metaSeries = exercicio.series || seriesHoje.length || 0;

  useEffect(() => {
    if (!expandido || seriesHoje.length > 0 || sugestao || buscandoSugestao) return;

    setBuscandoSugestao(true);
    fitnessApi
      .buscarUltimaExecucaoExercicio(exercicio.id)
      .then((resultado) => setSugestao(resultado))
      .catch(() => setSugestao(null))
      .finally(() => setBuscandoSugestao(false));
  }, [expandido, seriesHoje.length, sugestao, buscandoSugestao, exercicio.id]);

  const usarSugestao = () => {
    aoAdicionarSerie(exercicio.id, {
      carga: sugestao?.ultimaCarga ?? null,
      repeticoes: sugestao?.ultimasRepeticoes ?? exercicio.repeticoes ?? null,
    });
  };

  const removerExercicio = () => {
    const temHistorico = seriesHoje.length > 0;
    const mensagem = temHistorico
      ? `"${exercicio.nome}" já tem séries registradas hoje. Remover mesmo assim?`
      : `Remover "${exercicio.nome}" da ficha?`;
    if (window.confirm(mensagem)) {
      aoRemover(exercicio.id);
    }
  };

  return (
    <article className={`cardExercicioExecucao ${seriesConcluidas > 0 && seriesConcluidas === metaSeries ? 'cardConcluido' : ''}`}>
      <button type="button" className="cardExercicioHeader" onClick={() => setExpandido((prev) => !prev)} aria-expanded={expandido}>
        <div className="cardExercicioInfo">
          <p className={seriesConcluidas === metaSeries && metaSeries > 0 ? 'textoRiscado' : ''}>{exercicio.nome}</p>
          <span>{exercicio.descricao || `${metaSeries || '?'} séries x ${exercicio.repeticoes ?? '?'} rep`}</span>
        </div>
        <div className="cardExercicioMeta">
          <span className="cargaBadge">
            {seriesConcluidas}/{metaSeries || seriesHoje.length} séries
          </span>
          <ChevronDown size={18} strokeWidth={2.5} className={`chevron ${expandido ? 'chevronAberto' : ''}`} />
        </div>
      </button>

      {expandido && (
        <div className="cardExercicioCorpo">
          {seriesHoje.length === 0 && (buscandoSugestao || sugestao) && (
            <div className="bannerSugestao">
              {buscandoSugestao ? (
                <span>Buscando última execução…</span>
              ) : sugestao?.ultimaCarga != null || sugestao?.ultimasRepeticoes != null ? (
                <>
                  <span>
                    Sugestão (última vez): <strong>{sugestao.ultimaCarga ?? '—'} kg</strong> x{' '}
                    <strong>{sugestao.ultimasRepeticoes ?? '—'}</strong>
                    {sugestao.melhorCarga != null && sugestao.melhorCarga !== sugestao.ultimaCarga && (
                      <> · recorde: {sugestao.melhorCarga} kg</>
                    )}
                  </span>
                  <button type="button" className="btnUsarSugestao" onClick={usarSugestao}>
                    Usar sugestão
                  </button>
                </>
              ) : (
                <span>Primeira vez registrando este exercício — sem histórico ainda.</span>
              )}
            </div>
          )}

          {seriesHoje.length > 0 && (
            <ul className="listaSeries">
              {seriesHoje.map((serie) => (
                <LinhaSerie
                  key={serie.id}
                  serie={serie}
                  processando={Boolean(processando[`serie-${serie.id}`])}
                  aoAtualizar={aoAtualizarSerie}
                  aoConcluir={aoConcluirSerie}
                  aoExcluir={aoExcluirSerie}
                />
              ))}
            </ul>
          )}

          <div className="cardExercicioRodape">
            <button
              type="button"
              className="btnNovaSerie"
              disabled={Boolean(processando[`add-${exercicio.id}`])}
              onClick={() => aoAdicionarSerie(exercicio.id, { repeticoes: exercicio.repeticoes ?? null })}
            >
              <Plus size={14} strokeWidth={2.5} /> Nova série
            </button>
            <button type="button" className="btnRemoverExercicio" onClick={removerExercicio}>
              <Trash2 size={14} strokeWidth={2.5} /> Remover exercício
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
