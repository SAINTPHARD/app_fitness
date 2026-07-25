import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { obterResumoSemanalDeCalorias } from '../utils/resumoSemanal';

const COR_TEXTO_EIXO = '#94a3b8';
const COR_BORDA = '#dbe2ef';
const COR_LINHA = '#a3e635';

/**
 * Linha com o total de calorias dos últimos 7 dias — mesma fonte de dados
 * do gráfico de barras da Home (`obterResumoSemanalDeCalorias`), aqui como
 * linha para casar com o restante dos gráficos da Dieta.
 */
export default function GraficoCaloriasSemanais() {
  const dados = useMemo(() => obterResumoSemanalDeCalorias(), []);
  const temAlgumDado = dados.some((ponto) => ponto.calorias > 0);
  const ultimoValor = dados[dados.length - 1]?.calorias || 0;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Calorias dos últimos 7 dias</h3>
        {temAlgumDado && (
          <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-bold text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">
            {ultimoValor} kcal
          </span>
        )}
      </div>

      {temAlgumDado ? (
        <div className="-mx-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="dia" tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: `1px solid ${COR_BORDA}`, fontSize: 13 }}
                formatter={(valor) => [`${valor} kcal`, 'Calorias']}
              />
              <Line type="monotone" dataKey="calorias" stroke={COR_LINHA} strokeWidth={3} dot={{ r: 4, fill: COR_LINHA }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="m-0 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
          Registre refeições para ver seu histórico semanal aqui.
        </p>
      )}
    </div>
  );
}
