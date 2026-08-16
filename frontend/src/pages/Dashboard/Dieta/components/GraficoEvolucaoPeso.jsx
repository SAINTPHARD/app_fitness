import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatarDataParaExibicaoBr } from '../utils/calendario';

const COR_TEXTO_EIXO = '#94a3b8';
const COR_BORDA = '#dbe2ef';
const COR_LINHA = '#a3e635';

/**
 * Linha de evolução do peso (versão Tailwind, para a Dieta) — mesma fonte de
 * dados de `usePerfilResumo`, compartilhada com a Home e a Evolução; sem
 * pelo menos 2 pontos, mostramos um estado vazio em vez de inventar tendência.
 */
export default function GraficoEvolucaoPeso({ historicoPeso }) {
  const temHistoricoSuficiente = historicoPeso.length >= 2;
  const ultimoPeso = historicoPeso.length > 0 ? historicoPeso[historicoPeso.length - 1].peso : null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Evolução do peso</h3>
        {ultimoPeso !== null && (
          <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-bold text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">
            {ultimoPeso} kg
          </span>
        )}
      </div>

      {temHistoricoSuficiente ? (
        <div className="-mx-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicoPeso} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="data"
                tickFormatter={formatarDataParaExibicaoBr}
                tick={{ fill: COR_TEXTO_EIXO, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: `1px solid ${COR_BORDA}`, fontSize: 13 }}
                formatter={(valor) => [`${valor} kg`, 'Peso']}
              />
              <Line type="monotone" dataKey="peso" stroke={COR_LINHA} strokeWidth={3} dot={{ r: 4, fill: COR_LINHA }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">
            Continue atualizando seu peso no Perfil — com pelo menos 2 registros, o gráfico aparece aqui.
          </p>
          <Link to="/dashboard/perfil" className="text-sm font-bold text-lime-600 hover:underline dark:text-lime-300">
            Atualizar peso agora →
          </Link>
        </div>
      )}
    </div>
  );
}
