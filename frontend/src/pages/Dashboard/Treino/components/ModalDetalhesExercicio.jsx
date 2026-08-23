import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dumbbell, X } from 'lucide-react';
import { ehUrlMidiaValida } from '../utils/visualExercicio';

const ABAS = [
  { id: 'instrucoes', rotulo: 'Instruções' },
  { id: 'registros', rotulo: 'Registros' },
];

function LinhaMetadado({ termo, valor }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{termo}</dt>
      <dd className="text-right text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">{valor}</dd>
    </div>
  );
}

LinhaMetadado.propTypes = {
  termo: PropTypes.string.isRequired,
  valor: PropTypes.string.isRequired,
};

export default function ModalDetalhesExercicio({ exercicio, aoFechar, registros = [] }) {
  const [abaAtiva, setAbaAtiva] = useState('instrucoes');

  const midia = ehUrlMidiaValida(exercicio.gifUrl) ? exercicio.gifUrl.trim() : null;
  const instrucoes =
    exercicio.instructions?.trim() ||
    exercicio.descricao?.trim() ||
    'As instruções deste exercício ainda não foram cadastradas.';
  const areaFoco = exercicio.muscle || exercicio.grupoMuscular || 'Não informada';
  const equipamento = exercicio.equipment || 'Não informado';

  // Fecha com Esc e trava o scroll do body enquanto o modal está aberto.
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalhes-exercicio-titulo"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Detalhes do exercício</p>
            <h3 id="detalhes-exercicio-titulo" className="mt-1 truncate text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {exercicio.nome}
            </h3>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar detalhes"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </header>

        <div role="tablist" aria-label="Detalhes do exercício" className="mx-5 flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {ABAS.map((aba) => (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={abaAtiva === aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                abaAtiva === aba.id
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {aba.rotulo}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
          {abaAtiva === 'instrucoes' ? (
            <>
              <div className="grid aspect-video w-full place-items-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                {midia ? (
                  <img
                    src={midia}
                    alt={`Demonstração de ${exercicio.nome}`}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Dumbbell size={44} strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                )}
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {instrucoes}
              </p>

              <dl className="mt-4">
                <LinhaMetadado termo="Área de foco" valor={areaFoco} />
                <LinhaMetadado termo="Equipamento" valor={equipamento} />
              </dl>
            </>
          ) : registros.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum registro para este exercício ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {registros.map((serie) => (
                <li
                  key={serie.id}
                  className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    {serie.numeroSerie ?? '—'}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {serie.carga ?? '—'} kg x {serie.repeticoes ?? '—'} rep.
                  </span>
                  {serie.status === 'CONCLUIDA' && (
                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                      Concluída
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

ModalDetalhesExercicio.propTypes = {
  exercicio: PropTypes.shape({
    nome: PropTypes.string.isRequired,
    descricao: PropTypes.string,
    instructions: PropTypes.string,
    gifUrl: PropTypes.string,
    muscle: PropTypes.string,
    grupoMuscular: PropTypes.string,
    equipment: PropTypes.string,
  }).isRequired,
  aoFechar: PropTypes.func.isRequired,
  registros: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      numeroSerie: PropTypes.number,
      carga: PropTypes.number,
      repeticoes: PropTypes.number,
      status: PropTypes.string,
    }),
  ),
};
