import { Line, LineChart, ResponsiveContainer } from 'recharts';

const COR_LINHA = '#a3e635';

/**
 * Peso atual + variação, com uma sparkline (linha sem eixos) do histórico
 * recente ao lado — os dados vêm de `usePerfilResumo` (compartilhado com a
 * Home e a página Evolução), aqui só a apresentação muda.
 */
export default function CartaoPesoAtual({ peso, historicoPeso, variacaoPeso }) {
  const temHistorico = historicoPeso.length >= 2;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Peso Atual</h3>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-2xl font-bold text-slate-800 dark:text-zinc-50">{peso ? `${peso} kg` : '---'}</p>
          {variacaoPeso !== null && (
            <p className="m-0 mt-1 text-sm font-semibold text-slate-500 dark:text-zinc-400">
              {variacaoPeso <= 0 ? '↓' : '↑'} {Math.abs(variacaoPeso)}kg{' '}
              <span className="font-normal text-slate-400 dark:text-zinc-500">últimos 30 dias</span>
            </p>
          )}
        </div>

        {temHistorico && (
          <div className="h-12 w-24 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicoPeso}>
                <Line type="monotone" dataKey="peso" stroke={COR_LINHA} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
