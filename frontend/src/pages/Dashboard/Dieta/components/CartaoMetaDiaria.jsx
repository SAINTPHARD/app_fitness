import { calcularPercentual } from '../utils/progresso';

const RAIO_ANEL = 70;
const ESPESSURA_ANEL = 14;
const CIRCUNFERENCIA_ANEL = 2 * Math.PI * RAIO_ANEL;

/**
 * Cartão "Meta diária" com um anel colorido mostrando quanto ainda resta de
 * calorias no dia — modo de cálculo 100% automático: `restante` é sempre
 * `meta - consumido`, recalculado a cada render a partir dos dados reais de
 * `useRefeicoes`/`useMetas` (nada aqui é digitado manualmente pelo usuário).
 */
export default function CartaoMetaDiaria({ meta, consumido, aoEditar }) {
  const metaDefinida = Number(meta) > 0;
  const restante = meta - consumido;
  const excedeu = restante < 0;
  const percentualConsumido = calcularPercentual(consumido, meta);
  const offsetAnel = CIRCUNFERENCIA_ANEL - (percentualConsumido / 100) * CIRCUNFERENCIA_ANEL;
  const corAnel = excedeu ? '#fb7185' : '#22c55e';

  // Microinteração: um pequeno selo aparece perto de bater a meta, mesmo
  // sem ultrapassá-la — feedback positivo em vez de só um número neutro.
  const emCimaDaHora = !excedeu && meta > 0 && percentualConsumido >= 90;

  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none sm:flex-row sm:justify-between">
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h3 className="m-0 text-lg font-bold text-slate-800 dark:text-zinc-50">Meta diária</h3>
          <button
            type="button"
            onClick={aoEditar}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-lime-100 hover:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-400 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-lime-400/10 dark:hover:text-lime-300"
          >
            Editar
          </button>
          {emCimaDaHora && (
            <span className="animate-bounce rounded-full bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">
              🎯 Quase lá!
            </span>
          )}
        </div>
        <div>
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">Meta</p>
          <p className="m-0 text-xl font-bold text-slate-700 dark:text-zinc-100">
            {metaDefinida ? `${meta} kcal` : 'Meta não definida'}
          </p>
        </div>
        <div>
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">Consumido</p>
          <p className="m-0 text-xl font-bold text-slate-700 dark:text-zinc-100">{consumido} kcal</p>
        </div>
      </div>

      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={RAIO_ANEL} fill="none" stroke="#f1f5f9" strokeWidth={ESPESSURA_ANEL} className="dark:stroke-zinc-700" />
          <circle
            cx="80"
            cy="80"
            r={RAIO_ANEL}
            fill="none"
            stroke={corAnel}
            strokeWidth={ESPESSURA_ANEL}
            strokeLinecap="round"
            strokeDasharray={CIRCUNFERENCIA_ANEL}
            strokeDashoffset={offsetAnel}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <strong className="text-3xl font-bold text-slate-800 dark:text-zinc-50">{Math.abs(restante)}</strong>
          <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
            {metaDefinida ? (excedeu ? 'Acima da meta' : 'Restantes') : 'Configure'}
          </span>
        </div>
      </div>
    </div>
  );
}
