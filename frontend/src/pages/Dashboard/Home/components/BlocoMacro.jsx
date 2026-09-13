import PropTypes from 'prop-types';
import { CORES_MACRO } from '../utils/blocosMacro';
import { limitarPercentual } from '../utils/formatadores';

/**
 * Um bloco da grade do "Plano de hoje": ícone colorido, consumido/meta e a
 * barra fina de progresso. Recebe `children` para o caso da Água, que tem
 * ações próprias (registrar/desfazer) logo abaixo da barra — assim o bloco
 * segue genérico em vez de conhecer regras específicas de um macro.
 */
export default function BlocoMacro({ rotulo, Icone, cor, consumido, meta, unidade, percentual, notaExtra, children }) {
  const cores = CORES_MACRO[cor] ?? CORES_MACRO.brand;
  const progresso = limitarPercentual(percentual);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cores.fundoIcone}`}>
          <Icone size={16} className={cores.icone} aria-hidden="true" />
        </span>
        <span className="truncate text-xs font-semibold text-subtle">{rotulo}</span>
      </div>

      <p className="m-0 text-sm font-bold text-content">
        {consumido}
        <span className="font-medium text-subtle"> / {meta} {unidade}</span>
      </p>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`Progresso de ${rotulo.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progresso)}
      >
        <div className={`h-full rounded-full transition-[width] duration-300 ${cores.barra}`} style={{ width: `${progresso}%` }} />
      </div>

      {notaExtra && <p className="m-0 text-[11px] font-medium text-subtle">{notaExtra}</p>}

      {children}
    </div>
  );
}

BlocoMacro.propTypes = {
  rotulo: PropTypes.string.isRequired,
  Icone: PropTypes.elementType.isRequired,
  cor: PropTypes.oneOf(Object.keys(CORES_MACRO)).isRequired,
  consumido: PropTypes.string.isRequired,
  meta: PropTypes.string.isRequired,
  unidade: PropTypes.string.isRequired,
  percentual: PropTypes.number,
  notaExtra: PropTypes.string,
  children: PropTypes.node,
};
