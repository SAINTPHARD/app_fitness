import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { baixarCsv, montarCsvRelatorio, obterDadosRelatorio } from './utils/agregarRelatorio';
import { useHistoricoRefeicoes } from '../../../hooks/useHistoricoRefeicoes';
import estilos from './styles.module.css';

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 90, rotulo: '90 dias' },
];

const COR_LIME = '#a3e635';
const COR_EIXO = '#71717a';

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState(30);

  // CORREÇÃO: `obterDadosRelatorio` lia refeições de uma chave de
  // localStorage órfã ('dieta-refeicoes') que `useRefeicoes` não escreve
  // mais desde que passou a usar a API real — ver `useHistoricoRefeicoes`
  // para o diagnóstico completo. Agora busca de verdade no backend.
  const { refeicoesPorDia, carregando: carregandoHistorico } = useHistoricoRefeicoes(periodo);
  const { serie, resumo } = useMemo(
    () => obterDadosRelatorio(refeicoesPorDia, periodo),
    [refeicoesPorDia, periodo]
  );
  const seriePeso = useMemo(() => serie.filter((d) => d.peso != null), [serie]);

  const exportarCsv = () => {
    const csv = montarCsvRelatorio(serie);
    baixarCsv(csv, `relatorio-system-fitness-${periodo}d.csv`);
  };

  return (
    <section className={estilos.pagina}>
      <div className={estilos.topo}>
        <div className={estilos.cabecalho}>
          <p className={estilos.eyebrow}>Relatórios</p>
          <h2 className={estilos.titulo}>Estatísticas e exportação</h2>
          <p className={estilos.subtitulo}>
            Resumo do período com base nos seus registros de dieta, água, peso e treino.
          </p>
        </div>

        <div className={estilos.acoes} data-print-hide>
          <div className={estilos.filtros}>
            {PERIODOS.map((item) => (
              <button
                key={item.dias}
                type="button"
                className={`${estilos.filtro} ${periodo === item.dias ? estilos.filtroAtivo : ''}`}
                onClick={() => setPeriodo(item.dias)}
              >
                {item.rotulo}
              </button>
            ))}
          </div>
          <button type="button" className={estilos.botaoSecundario} onClick={exportarCsv}>
            <Download size={16} strokeWidth={2.5} />
            CSV
          </button>
          <button type="button" className={estilos.botaoPrimario} onClick={() => window.print()}>
            <Printer size={16} strokeWidth={2.5} />
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className={estilos.gradeResumo}>
        <article>
          {/* CORREÇÃO (P2.9): rótulo agora deixa explícito que a média é
              só dos dias com registro — `kcalMedia` (agregarRelatorio.js)
              soma e divide apenas por `diasComCalorias`, não pelos N dias
              inteiros do período, então um período com poucos dias
              registrados não tem a média "diluída" por zeros. */}
          <span>Kcal média (dias com registro)</span>
          <strong>{resumo.kcalMedia || '---'}</strong>
        </article>
        <article>
          <span>Água média / dia</span>
          <strong>{resumo.aguaMediaMl ? `${(resumo.aguaMediaMl / 1000).toFixed(1)} L` : '---'}</strong>
        </article>
        <article>
          <span>Variação de peso</span>
          <strong>
            {resumo.variacaoPeso != null
              ? `${resumo.variacaoPeso > 0 ? '+' : ''}${resumo.variacaoPeso} kg`
              : '---'}
          </strong>
        </article>
        <article>
          <span>Exercícios concluídos</span>
          <strong>
            {resumo.treinosTotal > 0 ? `${resumo.treinosConcluidos}/${resumo.treinosTotal}` : '---'}
          </strong>
        </article>
      </div>

      {carregandoHistorico ? (
        <div className={estilos.cartaoVazio}>
          <h3>Carregando relatório…</h3>
        </div>
      ) : resumo.diasComRegistro === 0 ? (
        <div className={estilos.cartaoVazio}>
          <h3>Sem dados neste período</h3>
          <p>Registre refeições, água ou peso para gerar o relatório automaticamente.</p>
        </div>
      ) : (
        <div className={estilos.gradeGraficos}>
          <div className={estilos.cartao}>
            <h3 className={estilos.cartaoTitulo}>Calorias por dia</h3>
            <div className={estilos.grafico}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={serie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="rotulo" tick={{ fill: COR_EIXO, fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: COR_EIXO, fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="calorias" fill={COR_LIME} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={estilos.cartao}>
            <h3 className={estilos.cartaoTitulo}>Evolução do peso</h3>
            <div className={estilos.grafico}>
              {seriePeso.length >= 2 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={seriePeso}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="rotulo" tick={{ fill: COR_EIXO, fontSize: 11 }} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: COR_EIXO, fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke={COR_LIME} strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className={estilos.vazioGrafico}>
                  Precisa de pelo menos 2 registros de peso no período para desenhar a linha.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
