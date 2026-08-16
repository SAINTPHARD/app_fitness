import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { obterDataDeHojeISO, formatarDataParaExibicaoBr } from '../../Dieta/utils/calendario';
import estilos from './GraficoEvolucaoPeso.module.css';

const COR_TEXTO_EIXO = '#64748b';
const COR_BORDA = '#dbe2ef';
const COR_LINHA = '#a3e635';

/**
 * Linha de evolução do peso, construída a partir do histórico local
 * registrado em `usePerfilResumo` (um ponto por dia, a partir do peso
 * cadastrado no Perfil). Sem pelo menos 2 pontos, mostramos um estado
 * vazio em vez de inventar uma tendência.
 */
export default function GraficoEvolucaoPeso({ historicoPeso, variacaoPeso, aoRegistrarPeso }) {
  const [peso, setPeso] = useState('');
  const [data, setData] = useState(obterDataDeHojeISO());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const temHistoricoSuficiente = historicoPeso.length >= 2;
  const ultimoPeso = historicoPeso.length > 0 ? historicoPeso[historicoPeso.length - 1].peso : null;
  const registrosFaltantes = Math.max(0, 2 - historicoPeso.length);

  const salvarPeso = async (evento) => {
    evento.preventDefault();
    if (!aoRegistrarPeso) return;

    setErro('');
    setSalvando(true);
    try {
      await aoRegistrarPeso({ data, peso });
      setPeso('');
    } catch (error) {
      setErro(error?.message || 'Não foi possível registrar o peso.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={estilos.cartao}>
      <div className={estilos.cabecalho}>
        <div>
          <h3 className={estilos.titulo}>Evolução do peso</h3>
          <p className={estilos.subtitulo}>{ultimoPeso !== null ? `${ultimoPeso} kg` : '--- kg'}</p>
        </div>
        {variacaoPeso !== null && (
          <span className={estilos.variacao}>
            {variacaoPeso <= 0 ? '↓' : '↑'} {Math.abs(variacaoPeso)}kg
          </span>
        )}
      </div>

      {temHistoricoSuficiente ? (
        <div className={estilos.areaGrafico}>
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
        <div className={estilos.vazio}>
          <p>
            {historicoPeso.length === 1
              ? `Último peso: ${ultimoPeso} kg. Falta 1 registro para exibir o gráfico.`
              : `Faltam ${registrosFaltantes} registros para exibir o gráfico de evolução.`}
          </p>
          {aoRegistrarPeso && (
            <form className={estilos.formPesoRapido} onSubmit={salvarPeso}>
              <input type="date" value={data} onChange={(evento) => setData(evento.target.value)} required />
              <input
                type="number"
                min="20"
                max="300"
                step="0.1"
                placeholder="Peso (kg)"
                value={peso}
                onChange={(evento) => setPeso(evento.target.value)}
                required
              />
              <button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Registrar peso'}
              </button>
            </form>
          )}
          {erro && <span className={estilos.erro}>{erro}</span>}
        </div>
      )}
    </div>
  );
}
