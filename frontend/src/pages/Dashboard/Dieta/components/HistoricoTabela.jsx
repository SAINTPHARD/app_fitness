import { useMemo, useState } from 'react';
import { obterHistoricoDiario } from '../utils/historicoDiario';
import { useHistoricoRefeicoes } from '../../../../hooks/useHistoricoRefeicoes';

const COLUNAS = [
  { chave: 'dataFormatada', rotulo: 'Data' },
  { chave: 'calorias', rotulo: 'Calorias (kcal)' },
  { chave: 'proteina', rotulo: 'Proteínas (g)' },
  { chave: 'carboidratos', rotulo: 'Carboidratos (g)' },
  { chave: 'gordura', rotulo: 'Gorduras (g)' },
  { chave: 'aguaLitros', rotulo: 'Água (L)' },
  { chave: 'peso', rotulo: 'Peso (kg)' },
];

const PERIODOS = [
  { rotulo: 'Semana', dias: 7 },
  { rotulo: 'Mês', dias: 30 },
  { rotulo: 'Trimestre', dias: 90 },
];

/**
 * Tabela com o resumo diário do período selecionado, juntando refeições,
 * hidratação e peso (`obterHistoricoDiario`) — só aparecem dias com algum
 * dado real registrado, nenhuma linha é preenchida artificialmente.
 */
export default function HistoricoTabela({ historicoPeso }) {
  const [periodoDias, setPeriodoDias] = useState(7);
  // CORREÇÃO: refeições agora vêm de verdade do backend (`useHistoricoRefeicoes`)
  // em vez da chave de localStorage órfã que `obterHistoricoDiario` lia antes
  // — ver esse hook para o diagnóstico completo dessa família de bugs.
  const { refeicoesPorDia, carregando } = useHistoricoRefeicoes(periodoDias);
  const linhas = useMemo(
    () => obterHistoricoDiario(historicoPeso, refeicoesPorDia, periodoDias),
    [historicoPeso, refeicoesPorDia, periodoDias]
  );

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Histórico</h3>

        <div className="flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-zinc-900/40">
          {PERIODOS.map((periodo) => (
            <button
              key={periodo.dias}
              type="button"
              onClick={() => setPeriodoDias(periodo.dias)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                periodoDias === periodo.dias
                  ? 'bg-white text-slate-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200',
              ].join(' ')}
            >
              {periodo.rotulo}
            </button>
          ))}
        </div>
      </div>

      {carregando ? (
        <p className="m-0 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">Carregando histórico…</p>
      ) : linhas.length > 0 ? (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                {COLUNAS.map((coluna) => (
                  <th
                    key={coluna.chave}
                    className={[
                      'whitespace-nowrap px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500',
                      coluna.chave === 'dataFormatada' ? 'sticky left-0 z-10 bg-white dark:bg-zinc-800' : '',
                    ].join(' ')}
                  >
                    {coluna.rotulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.iso} className="border-t border-slate-100 dark:border-zinc-700">
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-2.5 font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {linha.dataFormatada}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-300">{linha.calorias}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-300">{linha.proteina}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-300">{linha.carboidratos}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-300">{linha.gordura}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-300">{linha.aguaLitros}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-300">{linha.peso ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="m-0 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
          Sem histórico neste período — registre refeições, água ou peso para começar a preencher esta tabela.
        </p>
      )}
    </div>
  );
}
