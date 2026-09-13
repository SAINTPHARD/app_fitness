import { Link } from 'react-router-dom';
import { Dumbbell, Play } from 'lucide-react';
import { useFichasTreino } from '../../Treino/hooks/useFichasTreino';
import { obterIdDiaDaSemanaAtual, obterInfoDoDia } from '../../Treino/utils/diasSemana';

/**
 * Mostra o treino de hoje de verdade — reaproveita `useFichasTreino` (a
 * mesma fonte de dados persistida usada na página Treino) e o foco do dia
 * da semana atual. Não existe (ainda) um horário agendado por treino no
 * modelo de dados, então o botão de ação nunca inventa um horário fixo —
 * só aparece quando há mesmo um dado real para mostrar.
 */
export default function CartaoProximoTreino() {
  const { fichasPorDia } = useFichasTreino();
  const diaHojeId = obterIdDiaDaSemanaAtual();
  const infoHoje = obterInfoDoDia(diaHojeId);
  const exerciciosHoje = fichasPorDia[diaHojeId] || [];
  const concluidos = exerciciosHoje.filter((exercicio) => exercicio.concluido).length;
  const totalExercicios = exerciciosHoje.length;
  const ehDescanso = Boolean(infoHoje?.descanso);

  const textoBotao = ehDescanso
    ? 'Ver ficha de treino'
    : totalExercicios > 0
      ? 'Iniciar treino'
      : 'Montar ficha de hoje';

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Treino de hoje</h3>
          <p className="m-0 mt-1 text-xs text-slate-400 dark:text-zinc-500">Sua ficha programada para hoje.</p>
        </div>
        <Link
          to="/dashboard/treino"
          className="shrink-0 whitespace-nowrap text-xs font-bold text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Ver ficha completa →
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
          <Dumbbell size={20} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-bold text-slate-800 dark:text-zinc-50">{infoHoje?.foco}</p>
          <p className="m-0 mt-0.5 text-xs text-slate-400 dark:text-zinc-500">Hoje · {infoHoje?.label}</p>
          {!ehDescanso && (
            <p className="m-0 mt-1 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {totalExercicios > 0
                ? `${totalExercicios} exercícios · ${concluidos}/${totalExercicios} concluídos`
                : 'Nenhum exercício cadastrado para hoje ainda'}
            </p>
          )}
        </div>
      </div>

      <Link
        to="/dashboard/treino"
        className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700"
      >
        <Play size={14} strokeWidth={3} fill="currentColor" aria-hidden="true" />
        {textoBotao}
      </Link>
    </article>
  );
}
