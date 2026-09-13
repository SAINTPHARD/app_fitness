import { Info } from 'lucide-react';
import PropTypes from 'prop-types';

const LINHAS = [
  { chave: 'proteina', rotulo: 'Proteínas', corBarra: 'bg-gradient-to-r from-blue-500 to-cyan-400' },
  { chave: 'carboidratos', rotulo: 'Carboidratos', corBarra: 'bg-gradient-to-r from-amber-500 to-orange-400' },
  { chave: 'gordura', rotulo: 'Gorduras', corBarra: 'bg-gradient-to-r from-pink-500 to-rose-400' },
];

const formatar1Casa = (valor) => (Number(valor) || 0).toFixed(1);

/**
 * Resumo compacto dos 3 macros: valor consumido/meta lado a lado com o
 * percentual, e uma barra logo abaixo — complementa os 4 cartões do topo
 * dando uma visão "tudo junto" ao lado do gráfico de distribuição.
 */
export default function ResumoNutricional({ totais, metas, percentuais }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-base font-bold text-content">Resumo Nutricional</h3>
        <span title="Consumido/meta e % do dia para cada macro." className="text-subtle">
          <Info size={16} strokeWidth={2} />
        </span>
      </div>

      {LINHAS.map(({ chave, rotulo, corBarra }) => (
        <div key={chave}>
          {(() => {
            const chaveMeta = chave === 'proteina' ? 'proteinas' : chave === 'gordura' ? 'gorduras' : chave;
            const meta = Number(metas?.[chaveMeta]) || 0;
            const metaDefinida = meta > 0;
            const percentual = Number.isFinite(Number(percentuais[chave])) ? Number(percentuais[chave]) : 0;

            return (
              <>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-secondary">{rotulo}</span>
            <span className="text-subtle">
              {formatar1Casa(totais?.[chave])}g / {metaDefinida ? `${meta}g` : 'Meta não definida'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${corBarra}`}
                style={{ width: `${Math.min(percentual, 100)}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs font-bold text-subtle">
              {metaDefinida ? `${Math.round(percentual)}%` : '--'}
            </span>
          </div>
              </>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

ResumoNutricional.propTypes = { totais: PropTypes.object.isRequired, metas: PropTypes.object.isRequired, percentuais: PropTypes.object.isRequired };
