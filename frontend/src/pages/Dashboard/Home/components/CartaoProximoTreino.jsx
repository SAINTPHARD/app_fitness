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
    <article className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-bold text-content">Treino de hoje</h3>
          <p className="m-0 mt-1 text-xs text-subtle">Sua ficha programada para hoje.</p>
        </div>
        <Link
          to="/dashboard/treino"
          className="shrink-0 whitespace-nowrap text-xs font-bold text-subtle transition-colors hover:text-secondary"
        >
          Ver ficha completa →
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line bg-muted p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-ink">
          <Dumbbell size={20} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-bold text-content">{infoHoje?.foco}</p>
          <p className="m-0 mt-0.5 text-xs text-subtle">Hoje · {infoHoje?.label}</p>
          {!ehDescanso && (
            <p className="m-0 mt-1 text-xs font-semibold text-secondary">
              {totalExercicios > 0
                ? `${totalExercicios} exercícios · ${concluidos}/${totalExercicios} concluídos`
                : 'Nenhum exercício cadastrado para hoje ainda'}
            </p>
          )}
        </div>
      </div>

      <Link
        to="/dashboard/treino"
        className="flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-strong"
      >
        <Play size={14} strokeWidth={3} fill="currentColor" aria-hidden="true" />
        {textoBotao}
      </Link>
    </article>
  );
}
