import { Info } from 'lucide-react';

const LINHAS = [
  { chave: 'proteina', rotulo: 'Proteínas', corBarra: 'bg-gradient-to-r from-blue-500 to-cyan-400' },
  { chave: 'carboidratos', rotulo: 'Carboidratos', corBarra: 'bg-gradient-to-r from-amber-500 to-orange-400' },
  { chave: 'gordura', rotulo: 'Gorduras', corBarra: 'bg-gradient-to-r from-pink-500 to-rose-400' },
];

/**
 * Resumo compacto dos 3 macros: valor consumido/meta lado a lado com o
 * percentual, e uma barra logo abaixo — complementa os 4 cartões do topo
 * dando uma visão "tudo junto" ao lado do gráfico de distribuição.
 */
export default function ResumoNutricional({ totais, metas, percentuais }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Resumo Nutricional</h3>
        <span title="Consumido/meta e % do dia para cada macro." className="text-slate-300 dark:text-zinc-600">
          <Info size={16} strokeWidth={2} />
        </span>
      </div>

      {LINHAS.map(({ chave, rotulo, corBarra }) => (
        <div key={chave}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 dark:text-zinc-200">{rotulo}</span>
            <span className="text-slate-500 dark:text-zinc-400">
              {totais[chave]}g / {metas[chave === 'proteina' ? 'proteinas' : chave] || 0}g
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${corBarra}`}
                style={{ width: `${Math.min(percentuais[chave], 100)}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs font-bold text-slate-500 dark:text-zinc-400">
              {Math.round(percentuais[chave])}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
