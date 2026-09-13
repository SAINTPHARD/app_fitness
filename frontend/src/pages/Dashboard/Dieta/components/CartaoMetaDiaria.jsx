import { calcularPercentual } from '../utils/progresso';
import PropTypes from 'prop-types';

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
  const corAnel = excedeu ? 'var(--danger)' : 'var(--brand)';

  // Microinteração: um pequeno selo aparece perto de bater a meta, mesmo
  // sem ultrapassá-la — feedback positivo em vez de só um número neutro.
  const emCimaDaHora = !excedeu && meta > 0 && percentualConsumido >= 90;

  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:flex-row sm:justify-between">
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h3 className="m-0 text-lg font-bold text-content">Meta diária</h3>
          <button
            type="button"
            onClick={aoEditar}
            className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-secondary transition-colors hover:bg-brand-soft hover:text-brand-soft-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            Editar
          </button>
          {emCimaDaHora && (
            <span className="animate-bounce rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-soft-ink">
              🎯 Quase lá!
            </span>
          )}
        </div>
        <div>
          <p className="m-0 text-sm text-subtle">Meta</p>
          <p className="m-0 text-xl font-bold text-secondary">
            {metaDefinida ? `${meta} kcal` : 'Meta não definida'}
          </p>
        </div>
        <div>
          <p className="m-0 text-sm text-subtle">Consumido</p>
          <p className="m-0 text-xl font-bold text-secondary">{consumido} kcal</p>
        </div>
      </div>

      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={RAIO_ANEL} fill="none" stroke="var(--bg-muted)" strokeWidth={ESPESSURA_ANEL} />
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
          <strong className="text-3xl font-bold text-content">{Math.abs(restante)}</strong>
          <span className="text-sm font-semibold text-subtle">
            {metaDefinida ? (excedeu ? 'Acima da meta' : 'Restantes') : 'Configure'}
          </span>
        </div>
      </div>
    </div>
  );
}

CartaoMetaDiaria.propTypes = { meta: PropTypes.number.isRequired, consumido: PropTypes.number.isRequired, aoEditar: PropTypes.func.isRequired };
