import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CircleHelp, Plus } from 'lucide-react';
import api from '../../../../services/api';
import ModalDetalhesExercicio from './ModalDetalhesExercicio';
import MiniaturaExercicio from './MiniaturaExercicio';
import {
  mensagemErroCatalogo,
  normalizarMusculoCatalogo,
  normalizarRespostaCatalogo,
} from '../utils/catalogoExerciciosApi';

/** Junta apenas as informações preenchidas, evitando "undefined · undefined". */
function montarResumo(partes) {
  return partes
    .map((parte) => String(parte ?? '').trim())
    .filter(Boolean)
    .join(' · ');
}

function LinhaCatalogo({ exercicio, musculoNormalizado, aoAbrirDetalhes, aoAdicionar }) {
  const nome = exercicio?.name?.trim() || 'Exercício sem nome';
  const resumo =
    montarResumo([exercicio?.muscle || musculoNormalizado, exercicio?.equipment, exercicio?.difficulty]) ||
    'Detalhes não informados';

  return (
    <li className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800">
      <MiniaturaExercicio
        nome={nome}
        grupoMuscular={exercicio?.muscle || musculoNormalizado}
        gifUrl={exercicio?.gifUrl}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-zinc-900 dark:text-zinc-100">{nome}</p>
        <p className="mt-0.5 truncate text-sm capitalize text-zinc-500 dark:text-zinc-400">{resumo}</p>
      </div>

      <button
        type="button"
        onClick={() => aoAdicionar(exercicio)}
        aria-label={`Adicionar ${nome} ao treino`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 active:scale-95"
      >
        <Plus size={18} strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={() => aoAbrirDetalhes({ ...exercicio, nome })}
        aria-label={`Ver detalhes de ${nome}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <CircleHelp size={18} />
      </button>
    </li>
  );
}

LinhaCatalogo.propTypes = {
  exercicio: PropTypes.object.isRequired,
  musculoNormalizado: PropTypes.string.isRequired,
  aoAbrirDetalhes: PropTypes.func.isRequired,
  aoAdicionar: PropTypes.func.isRequired,
};

export default function CatalogoExercicios({ musculoAlvo, onAdicionarExercicio }) {
  const [exercicios, setExercicios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const musculoNormalizado = normalizarMusculoCatalogo(musculoAlvo);

  useEffect(() => {
    const controller = new AbortController();

    if (!musculoNormalizado) {
      setExercicios([]);
      setCarregando(false);
      setErro('Selecione um músculo válido para consultar o catálogo.');
      return () => controller.abort();
    }

    async function carregarExercicios() {
      setCarregando(true);
      setErro('');

      try {
        // Catálogo local (servido pelo próprio backend a partir de um JSON
        // estático) — instantâneo, sem serviço externo envolvido.
        const response = await api.get(
          `/api/catalogo-exercicios/musculo/${encodeURIComponent(musculoNormalizado)}`,
          { signal: controller.signal, silenciarErroGlobal: true },
        );

        if (!controller.signal.aborted) {
          setExercicios(normalizarRespostaCatalogo(response.data));
        }
      } catch (error) {
        const cancelada = controller.signal.aborted || error?.code === 'ERR_CANCELED';

        if (!cancelada) {
          setExercicios([]);
          setErro(mensagemErroCatalogo(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarExercicios();
    return () => controller.abort();
  }, [musculoNormalizado, tentativa]);

  return (
    <section
      aria-labelledby="catalogo-externo-titulo"
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Catálogo</p>
          <h3 id="catalogo-externo-titulo" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Catálogo de exercícios
          </h3>
        </div>
        {musculoNormalizado && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {musculoNormalizado}
          </span>
        )}
      </div>

      {carregando && (
        <p aria-live="polite" className="rounded-xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          Carregando exercícios…
        </p>
      )}

      {!carregando && erro && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center dark:border-rose-500/25 dark:bg-rose-500/10"
        >
          <p className="text-sm text-rose-700 dark:text-rose-300">{erro}</p>
          <button
            type="button"
            onClick={() => setTentativa((valor) => valor + 1)}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && exercicios.length === 0 && (
        <p className="rounded-xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          Nenhum exercício encontrado para este músculo.
        </p>
      )}

      {!carregando && !erro && exercicios.length > 0 && (
        <ul className="flex flex-col gap-2">
          {exercicios.map((exercicio, indice) => (
            <LinhaCatalogo
              key={`${musculoNormalizado}-${exercicio?.name?.trim() || 'exercicio'}-${indice}`}
              exercicio={exercicio}
              musculoNormalizado={musculoNormalizado}
              aoAbrirDetalhes={setExercicioSelecionado}
              aoAdicionar={onAdicionarExercicio}
            />
          ))}
        </ul>
      )}

      {exercicioSelecionado && (
        <ModalDetalhesExercicio exercicio={exercicioSelecionado} aoFechar={() => setExercicioSelecionado(null)} />
      )}
    </section>
  );
}

CatalogoExercicios.propTypes = {
  musculoAlvo: PropTypes.string,
  onAdicionarExercicio: PropTypes.func.isRequired,
};
