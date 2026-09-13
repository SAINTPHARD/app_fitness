import PropTypes from 'prop-types';

/**
 * Um dos 4 cartões compactos do topo da Dieta (Calorias, Proteínas,
 * Carboidratos, Gorduras): ícone colorido + valor consumido/meta + barra
 * fina com o percentual ao lado — substitui o antigo card único do "Daily
 * Calorie Intake" por 4 cartões simétricos, mais fáceis de escanear.
 */
export default function CartaoMetricaMacro({ icone: Icone, corIcone, rotulo, consumido, meta, unidade, percentual, alerta }) {
  const metaDefinida = Number(meta) > 0;
  const percentualSeguro = Number.isFinite(Number(percentual)) ? Number(percentual) : 0;

  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${corIcone}`}>
          <Icone size={18} strokeWidth={2.5} />
        </span>
        <p className="m-0 text-sm font-bold text-secondary">{rotulo}</p>
      </div>

      <p className="m-0 text-xl font-bold text-content">
        {consumido}
        <span className="text-sm font-semibold text-subtle">
          {metaDefinida ? ` / ${meta}${unidade}` : ' / Meta não definida'}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${alerta ? 'bg-[var(--danger)]' : 'bg-brand'}`}
            style={{ width: `${Math.min(percentualSeguro, 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-subtle">
          {metaDefinida ? `${Math.round(percentualSeguro)}%` : '--'}
        </span>
      </div>
    </article>
  );
}

CartaoMetricaMacro.propTypes = { icone: PropTypes.elementType.isRequired, corIcone: PropTypes.string, rotulo: PropTypes.string.isRequired, consumido: PropTypes.number.isRequired, meta: PropTypes.number.isRequired, unidade: PropTypes.string.isRequired, percentual: PropTypes.number.isRequired, alerta: PropTypes.bool };
