import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, ChevronDown, CircleHelp, Plus, Trash2, X } from 'lucide-react';
import { fitnessApi } from '../../../../services/fitnessApi';
import { obterErroSerie } from '../utils/validarSerie';
import { descreverExercicio } from '../utils/visualExercicio';
import MiniaturaExercicio from './MiniaturaExercicio';
import ModalDetalhesExercicio from './ModalDetalhesExercicio';

const CLASSES_INPUT_NUMERO =
  'w-full min-w-0 bg-transparent text-center text-base font-bold tabular-nums outline-none ' +
  'disabled:cursor-default [appearance:textfield] ' +
  '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

function numeroOuNull(valor) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

/** Caixa cinza suave de um campo da série (KG ou Rep.). */
function CampoSerie({ sufixo, rotuloAcessivel, valor, aoDigitar, aoSalvar, desabilitado, concluida, inputProps }) {
  return (
    <label className="min-w-0 flex-1">
      <span className="sr-only">{rotuloAcessivel}</span>
      <span
        className={`flex h-11 items-center gap-1 rounded-lg px-2 transition-colors ${
          concluida ? 'bg-white/15' : 'bg-white ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700'
        }`}
      >
        <input
          type="number"
          value={valor}
          disabled={desabilitado}
          onChange={(event) => aoDigitar(event.target.value)}
          onBlur={aoSalvar}
          placeholder="—"
          className={`${CLASSES_INPUT_NUMERO} ${
            concluida
              ? 'text-white placeholder:text-white/60'
              : 'text-zinc-900 placeholder:text-zinc-300 dark:text-zinc-100 dark:placeholder:text-zinc-600'
          }`}
          {...inputProps}
        />
        <span
          aria-hidden="true"
          className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${
            concluida ? 'text-white/80' : 'text-zinc-400 dark:text-zinc-500'
          }`}
        >
          {sufixo}
        </span>
      </span>
    </label>
  );
}

CampoSerie.propTypes = {
  sufixo: PropTypes.string.isRequired,
  rotuloAcessivel: PropTypes.string.isRequired,
  valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  aoDigitar: PropTypes.func.isRequired,
  aoSalvar: PropTypes.func.isRequired,
  desabilitado: PropTypes.bool,
  concluida: PropTypes.bool,
  inputProps: PropTypes.object,
};

/**
 * Linha horizontal de uma série: círculo de seleção + carga + repetições.
 * A linha inteira vira verde assim que a série é marcada como concluída.
 */
function LinhaSerie({ serie, processando, aoAtualizar, aoConcluir, aoExcluir }) {
  const [carga, setCarga] = useState(serie.carga ?? '');
  const [repeticoes, setRepeticoes] = useState(serie.repeticoes ?? '');

  const concluida = serie.status === 'CONCLUIDA';
  const pendenteCriacao = String(serie.id).startsWith('temp-');
  const bloqueada = concluida || processando || pendenteCriacao;
  const erroPreenchimento = concluida ? null : obterErroSerie(carga, repeticoes);
  const podeConcluir = !bloqueada && !erroPreenchimento;

  useEffect(() => {
    setCarga(serie.carga ?? '');
    setRepeticoes(serie.repeticoes ?? '');
  }, [serie.carga, serie.repeticoes]);

  const salvar = () => {
    aoAtualizar(serie.id, {
      exercicioId: serie.exercicioId,
      carga: numeroOuNull(carga),
      repeticoes: numeroOuNull(repeticoes),
    });
  };

  return (
    <li>
      <div
        className={`flex items-center gap-2 rounded-xl p-2 transition-colors duration-150 ${
          concluida ? 'bg-emerald-600 text-white' : 'bg-zinc-50 dark:bg-zinc-800'
        }`}
      >
        <button
          type="button"
          onClick={() => aoConcluir(serie.id)}
          disabled={!podeConcluir}
          aria-pressed={concluida}
          aria-label={concluida ? `Série ${serie.numeroSerie} concluída` : `Concluir série ${serie.numeroSerie}`}
          title={pendenteCriacao ? 'Aguarde a sincronização antes de concluir' : undefined}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition ${
            concluida
              ? 'border-white/70 bg-white/20 text-white'
              : 'border-zinc-300 text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300'
          }`}
        >
          {concluida ? <Check size={16} strokeWidth={3} /> : serie.numeroSerie}
        </button>

        <CampoSerie
          sufixo="kg"
          rotuloAcessivel={`Carga da série ${serie.numeroSerie} em quilogramas`}
          valor={carga}
          aoDigitar={setCarga}
          aoSalvar={salvar}
          desabilitado={bloqueada}
          concluida={concluida}
          inputProps={{ inputMode: 'decimal', min: '0', step: '0.5' }}
        />

        <CampoSerie
          sufixo="rep."
          rotuloAcessivel={`Repetições da série ${serie.numeroSerie}`}
          valor={repeticoes}
          aoDigitar={setRepeticoes}
          aoSalvar={salvar}
          desabilitado={bloqueada}
          concluida={concluida}
          inputProps={{ inputMode: 'numeric', min: '1', step: '1' }}
        />

        <button
          type="button"
          onClick={() => aoExcluir(serie)}
          disabled={processando}
          aria-label={`Excluir série ${serie.numeroSerie}`}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition disabled:opacity-40 ${
            concluida
              ? 'text-white/70 hover:bg-white/15 hover:text-white'
              : 'text-zinc-400 hover:bg-zinc-200 hover:text-rose-600 dark:hover:bg-zinc-700 dark:hover:text-rose-400'
          }`}
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {(erroPreenchimento || serie.pendenteSincronizacao) && (
        <p className="mt-1 pl-12 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {erroPreenchimento && (
            <span className="text-rose-600 dark:text-rose-400" role="alert">
              {erroPreenchimento}
            </span>
          )}
          {erroPreenchimento && serie.pendenteSincronizacao && ' · '}
          {serie.pendenteSincronizacao && (pendenteCriacao ? 'Salva offline' : 'Sincronização pendente')}
        </p>
      )}
    </li>
  );
}

LinhaSerie.propTypes = {
  serie: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    exercicioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    numeroSerie: PropTypes.number,
    carga: PropTypes.number,
    repeticoes: PropTypes.number,
    status: PropTypes.string,
    pendenteSincronizacao: PropTypes.bool,
  }).isRequired,
  processando: PropTypes.bool,
  aoAtualizar: PropTypes.func.isRequired,
  aoConcluir: PropTypes.func.isRequired,
  aoExcluir: PropTypes.func.isRequired,
};

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
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [sugestao, setSugestao] = useState(null);
  const [buscandoSugestao, setBuscandoSugestao] = useState(false);

  const seriesConcluidas = seriesHoje.filter((serie) => serie.status === 'CONCLUIDA').length;
  const metaSeries = exercicio.series || seriesHoje.length || 0;
  const exercicioCompleto = metaSeries > 0 && seriesConcluidas >= metaSeries;
  const adicionando = Boolean(processando[`add-${exercicio.id}`]);

  useEffect(() => {
    if (!expandido || seriesHoje.length > 0 || sugestao || buscandoSugestao) return;

    let ativo = true;
    setBuscandoSugestao(true);
    fitnessApi
      .buscarUltimaExecucaoExercicio(exercicio.id)
      .then((resultado) => ativo && setSugestao(resultado))
      .catch(() => ativo && setSugestao(null))
      .finally(() => ativo && setBuscandoSugestao(false));

    return () => {
      ativo = false;
    };
  }, [expandido, seriesHoje.length, sugestao, buscandoSugestao, exercicio.id]);

  const adicionarProximaSerie = () => {
    aoAdicionarSerie(exercicio.id, { repeticoes: exercicio.repeticoes ?? null });
  };

  const usarSugestao = () => {
    aoAdicionarSerie(exercicio.id, {
      carga: sugestao?.ultimaCarga ?? null,
      repeticoes: sugestao?.ultimasRepeticoes ?? exercicio.repeticoes ?? null,
    });
  };

  const removerExercicio = () => {
    const mensagem =
      seriesHoje.length > 0
        ? `"${exercicio.nome}" já tem séries registradas hoje. Remover mesmo assim?`
        : `Remover "${exercicio.nome}" da ficha?`;
    if (window.confirm(mensagem)) aoRemover(exercicio.id);
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition-colors dark:bg-zinc-900 ${
        exercicioCompleto
          ? 'border-emerald-500/60 dark:border-emerald-500/40'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setExpandido((prev) => !prev)}
          aria-expanded={expandido}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <MiniaturaExercicio nome={exercicio.nome} grupoMuscular={exercicio.grupoMuscular} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-zinc-900 dark:text-zinc-100">{exercicio.nome}</span>
            <span className="mt-0.5 block truncate text-sm text-zinc-500 dark:text-zinc-400">
              {descreverExercicio(exercicio, seriesHoje.length)}
            </span>
          </span>
        </button>

        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums sm:block ${
            exercicioCompleto
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          {seriesConcluidas}/{metaSeries || seriesHoje.length}
        </span>

        <button
          type="button"
          onClick={() => setDetalhesAbertos(true)}
          aria-label={`Ver detalhes de ${exercicio.nome}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <CircleHelp size={18} />
        </button>

        <button
          type="button"
          onClick={() => setExpandido((prev) => !prev)}
          aria-label={expandido ? `Recolher ${exercicio.nome}` : `Expandir ${exercicio.nome}`}
          aria-expanded={expandido}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronDown size={18} strokeWidth={2.5} className={`transition-transform ${expandido ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {expandido && (
        <div className="border-t border-zinc-100 px-3 pb-3 pt-3 dark:border-zinc-800">
          {seriesHoje.length === 0 && (buscandoSugestao || sugestao) && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {buscandoSugestao ? (
                <span>Buscando última execução…</span>
              ) : sugestao?.ultimaCarga != null || sugestao?.ultimasRepeticoes != null ? (
                <>
                  <span>
                    Última vez:{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100">{sugestao.ultimaCarga ?? '—'} kg</strong> x{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100">{sugestao.ultimasRepeticoes ?? '—'}</strong>
                    {sugestao.melhorCarga != null && sugestao.melhorCarga !== sugestao.ultimaCarga && (
                      <> · recorde {sugestao.melhorCarga} kg</>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={usarSugestao}
                    disabled={adicionando}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    Usar sugestão
                  </button>
                </>
              ) : (
                <span>Primeira vez registrando este exercício.</span>
              )}
            </div>
          )}

          {seriesHoje.length > 0 && (
            <ul className="mb-3 flex flex-col gap-2">
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

          <button
            type="button"
            onClick={adicionarProximaSerie}
            disabled={adicionando}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
          >
            <Plus size={18} strokeWidth={3} />
            {adicionando
              ? 'Registrando…'
              : seriesHoje.length === 0
                ? 'Registrar primeira série'
                : 'Registrar a próxima série'}
          </button>

          <button
            type="button"
            onClick={removerExercicio}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-50 hover:text-rose-600 dark:hover:bg-zinc-800 dark:hover:text-rose-400"
          >
            <Trash2 size={14} strokeWidth={2.5} /> Remover exercício da ficha
          </button>
        </div>
      )}

      {detalhesAbertos && (
        <ModalDetalhesExercicio
          exercicio={exercicio}
          registros={seriesHoje}
          aoFechar={() => setDetalhesAbertos(false)}
        />
      )}
    </article>
  );
}

CardExercicioExecucao.propTypes = {
  exercicio: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nome: PropTypes.string.isRequired,
    descricao: PropTypes.string,
    grupoMuscular: PropTypes.string,
    series: PropTypes.number,
    repeticoes: PropTypes.number,
  }).isRequired,
  seriesHoje: PropTypes.array.isRequired,
  processando: PropTypes.object.isRequired,
  expandidoInicialmente: PropTypes.bool,
  aoAdicionarSerie: PropTypes.func.isRequired,
  aoAtualizarSerie: PropTypes.func.isRequired,
  aoConcluirSerie: PropTypes.func.isRequired,
  aoExcluirSerie: PropTypes.func.isRequired,
  aoRemover: PropTypes.func.isRequired,
};
