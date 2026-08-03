import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { obterResumoSemanalDeCalorias } from '../../Dieta/utils/resumoSemanal';
import { useHistoricoRefeicoes } from '../../../../hooks/useHistoricoRefeicoes';
import estilos from './GraficoSemanal.module.css';

// Cores fixas (em vez de `var(--...)`) porque atributos SVG dentro do
// Recharts nem sempre resolvem custom properties de forma confiável —
// os valores abaixo espelham os tokens de `index.css` (--border, --text-muted, --brand).
const COR_GRADE = '#dbe2ef';
const COR_TEXTO_EIXO = '#64748b';
const COR_BARRA = '#a3e635';

/**
 * Gráfico de barras com o total de calorias consumidas em cada um dos
 * últimos 7 dias — construído inteiramente a partir dos dados reais já
 * salvos na Dieta, buscados de verdade no backend via
 * `useHistoricoRefeicoes` (ver esse hook para o histórico da correção —
 * antes isto lia uma chave de localStorage órfã e mostrava dados zerados);
 * dias sem refeições aparecem com a barra zerada, nenhum valor é inventado.
 */
export default function GraficoSemanal() {
  const { refeicoesPorDia } = useHistoricoRefeicoes(7);
  const dados = useMemo(() => obterResumoSemanalDeCalorias(refeicoesPorDia, 7), [refeicoesPorDia]);
  const temAlgumDado = dados.some((ponto) => ponto.calorias > 0);

  return (
    <div className={estilos.cartao}>
      <div className={estilos.cabecalho}>
        <h3 className={estilos.titulo}>Calorias na semana</h3>
        <p className={estilos.subtitulo}>Últimos 7 dias</p>
      </div>

      {temAlgumDado ? (
        <div className={estilos.areaGrafico}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={COR_GRADE} vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: 12, border: `1px solid ${COR_GRADE}`, fontSize: 13 }}
                formatter={(valor) => [`${valor} kcal`, 'Calorias']}
              />
              <Bar dataKey="calorias" fill={COR_BARRA} radius={[8, 8, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={estilos.vazio}>Registre refeições na Dieta para ver seu histórico semanal aqui.</p>
      )}
    </div>
  );
}
