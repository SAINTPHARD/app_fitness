import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const CORES = { proteina: '#22c55e', carboidratos: '#eab308', gordura: '#a855f7' };
const numeroSeguro = (valor) => Number(valor) || 0;
const formatar1Casa = (valor) => numeroSeguro(valor).toFixed(1);

/**
 * Distribuição relativa dos 3 macros consumidos hoje (% em gramas de cada
 * um sobre o total dos três) — diferente dos cartões do topo, que comparam
 * cada macro com sua PRÓPRIA meta; aqui é proteína vs. carbo vs. gordura
 * entre si.
 */
export default function DistribuicaoMacronutrientes({ totais }) {
  const totalGramas =
    numeroSeguro(totais?.proteina) + numeroSeguro(totais?.carboidratos) + numeroSeguro(totais?.gordura);

  const dados = useMemo(() => {
    if (totalGramas <= 0) return [];

    return [
      { chave: 'proteina', rotulo: 'Proteínas', gramas: numeroSeguro(totais?.proteina) },
      { chave: 'carboidratos', rotulo: 'Carboidratos', gramas: numeroSeguro(totais?.carboidratos) },
      { chave: 'gordura', rotulo: 'Gorduras', gramas: numeroSeguro(totais?.gordura) },
    ].filter((fatia) => fatia.gramas > 0);
  }, [totais, totalGramas]);

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Distribuição de Macronutrientes</h3>

      {dados.length > 0 ? (
        <div className="flex items-center gap-6">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dados} dataKey="gramas" nameKey="rotulo" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {dados.map((fatia) => (
                    <Cell key={fatia.chave} fill={CORES[fatia.chave]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {dados.map((fatia) => (
              <li key={fatia.chave} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CORES[fatia.chave] }} />
                <span className="font-semibold text-slate-700 dark:text-zinc-200">{fatia.rotulo}</span>
                <span className="text-slate-400 dark:text-zinc-500">
                  {formatar1Casa(fatia.gramas)}g ({Math.round((fatia.gramas / totalGramas) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">Registre alimentos hoje para ver a distribuição aqui.</p>
      )}
    </div>
  );
}
