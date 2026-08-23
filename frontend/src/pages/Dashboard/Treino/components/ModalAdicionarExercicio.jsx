import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import { gruposMusculares } from '../utils/catalogoExercicios';
import { normalizarTexto } from '../utils/visualExercicio';
import MiniaturaExercicio from './MiniaturaExercicio';

/**
 * Gaveta de seleção manual de exercícios da ficha.
 * Segue o mesmo padrão visual dos cards de treino: bottom-sheet no mobile,
 * modal centralizado no desktop, acordeão por grupamento muscular e busca
 * que ignora acentos.
 */
export default function ModalAdicionarExercicio({ diaLabel, aoFechar, aoSelecionar }) {
  const [busca, setBusca] = useState('');
  const [grupoAberto, setGrupoAberto] = useState(null);

  const termo = normalizarTexto(busca);
  const buscando = termo.length > 0;

  const grupos = useMemo(() => {
    if (!buscando) {
      return gruposMusculares.map((grupo) => ({ ...grupo, exerciciosVisiveis: grupo.exercicios }));
    }

    return gruposMusculares
      .map((grupo) => {
        const grupoCombina = normalizarTexto(grupo.nome).includes(termo);
        const exerciciosVisiveis = grupoCombina
          ? grupo.exercicios
          : grupo.exercicios.filter((exercicio) => normalizarTexto(exercicio.nome).includes(termo));
        return { ...grupo, exerciciosVisiveis };
      })
      .filter((grupo) => grupo.exerciciosVisiveis.length > 0);
  }, [buscando, termo]);

  const totalEncontrado = grupos.reduce((total, grupo) => total + grupo.exerciciosVisiveis.length, 0);

  // Fecha com Esc e trava o scroll do body enquanto a gaveta está aberta.
  useEffect(() => {
    const aoTeclar = (event) => {
      if (event.key === 'Escape') aoFechar();
    };
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', aoTeclar);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aoFechar]);

  return (
    <div
      role="presentation"
      onMouseDown={aoFechar}
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="adicionar-exercicio-titulo"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Adicionar à ficha</p>
            <h3 id="adicionar-exercicio-titulo" className="mt-1 truncate text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {diaLabel}
            </h3>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar seleção de exercícios"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </header>

        <div className="px-5 pb-3">
          <label className="flex h-11 items-center gap-2 rounded-xl bg-zinc-100 px-3 dark:bg-zinc-800">
            <Search size={16} className="shrink-0 text-zinc-400" aria-hidden="true" />
            <span className="sr-only">Buscar exercício</span>
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar exercício ou grupo…"
              className="w-full min-w-0 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {grupos.length === 0 ? (
            <p className="rounded-xl bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
              Nenhum exercício encontrado para “{busca.trim()}”.
            </p>
          ) : (
            <>
              {buscando && (
                <p aria-live="polite" className="pb-2 text-xs font-medium text-zinc-400">
                  {totalEncontrado} {totalEncontrado === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
                </p>
              )}

              <ul className="flex flex-col gap-2">
                {grupos.map((grupo) => {
                  const aberto = buscando || grupoAberto === grupo.id;

                  return (
                    <li key={grupo.id} className="overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                      <button
                        type="button"
                        onClick={() => setGrupoAberto(aberto && !buscando ? null : grupo.id)}
                        aria-expanded={aberto}
                        className="flex w-full items-center gap-3 px-3 py-3 text-left"
                      >
                        <span className="min-w-0 flex-1 truncate font-bold text-zinc-900 dark:text-zinc-100">
                          {grupo.nome}
                        </span>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                          {grupo.exerciciosVisiveis.length}
                        </span>
                        <ChevronDown
                          size={18}
                          strokeWidth={2.5}
                          aria-hidden="true"
                          className={`shrink-0 text-zinc-400 transition-transform ${aberto ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {aberto && (
                        <ul className="flex flex-col gap-2 px-2 pb-2">
                          {grupo.exerciciosVisiveis.map((exercicio) => (
                            <li
                              key={exercicio.id}
                              className="flex items-center gap-3 rounded-xl bg-white p-2.5 dark:bg-zinc-900"
                            >
                              <MiniaturaExercicio nome={exercicio.nome} grupoMuscular={grupo.nome} tamanho="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-zinc-900 dark:text-zinc-100">{exercicio.nome}</p>
                                <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                                  Sugestão: {exercicio.seriesPadrao}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => aoSelecionar(exercicio)}
                                aria-label={`Adicionar ${exercicio.nome} à ficha`}
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 active:scale-95"
                              >
                                <Plus size={18} strokeWidth={3} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

ModalAdicionarExercicio.propTypes = {
  diaLabel: PropTypes.string,
  aoFechar: PropTypes.func.isRequired,
  aoSelecionar: PropTypes.func.isRequired,
};
