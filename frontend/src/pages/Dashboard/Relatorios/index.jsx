import { useEffect, useMemo, useState } from 'react';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { baixarCsv, calcularComparacao, formatarNumeroRelatorio, montarCsvRelatorio } from './utils/agregarRelatorio';
import { fitnessApi } from '../../../services/fitnessApi';
import { notificarSucesso } from '../../../utils/notificacoes';
import estilos from './styles.module.css';

const PERIODOS = [7, 30, 90];
const METRICAS = [
  ['caloriasMedia', 'Média calórica', 'kcal'], ['hidratacaoMediaMl', 'Hidratação média', 'ml'],
  ['variacaoPeso', 'Variação de peso', 'kg'], ['sessoesConcluidas', 'Sessões concluídas', ''],
  ['frequenciaSemanal', 'Frequência de treino', '/semana'], ['aderenciaPercentual', 'Aderência à ficha', '%'],
  ['volumeTotalKg', 'Volume total', 'kg'],
];
const formatarData = (data) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T12:00:00`));

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState(30);
  const [relatorio, setRelatorio] = useState(null);
  const [estado, setEstado] = useState('carregando');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setEstado(navigator.onLine ? 'carregando' : 'offline');
    if (!navigator.onLine) return () => { ativo = false; };
    fitnessApi.obterRelatorioConsolidado(periodo)
      .then((dados) => { if (ativo) { setRelatorio(dados); setEstado('pronto'); } })
      .catch(() => { if (ativo) setEstado(navigator.onLine ? 'erro' : 'offline'); });
    return () => { ativo = false; };
  }, [periodo, tentativa]);

  const temDados = useMemo(() => relatorio && (relatorio.atual.caloriasMedia > 0 || relatorio.atual.hidratacaoMediaMl > 0 || relatorio.atual.sessoesConcluidas > 0 || relatorio.serie.some((item) => item.peso != null)), [relatorio]);
  const seriePeso = (relatorio?.serie || []).filter((item) => item.peso != null);
  const podeExportar = estado === 'pronto' && temDados;
  const exportarCsv = () => baixarCsv(montarCsvRelatorio(relatorio), `relatorio-system-fitness-${periodo}-dias.csv`);
  const imprimirRelatorio = () => { notificarSucesso('Abrindo relatório para salvar como PDF…'); window.print(); };

  return <section className={estilos.pagina} aria-busy={estado === 'carregando'}>
    <header className={estilos.topo}>
      <div className={estilos.cabecalho}><p className={estilos.eyebrow}>Relatórios</p><h2 className={estilos.titulo}>Desempenho consolidado</h2><p className={estilos.subtitulo}>Dieta, hidratação, peso e treino agregados diretamente da sua conta.</p>{relatorio && <p className={estilos.periodoImpresso}>Período: {formatarData(relatorio.inicio)} a {formatarData(relatorio.fim)} · Gerado em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}</p>}</div>
      <div className={estilos.acoes} data-print-hide><div className={estilos.filtros} aria-label="Período do relatório">{PERIODOS.map((dias) => <button key={dias} type="button" aria-pressed={periodo === dias} className={`${estilos.filtro} ${periodo === dias ? estilos.filtroAtivo : ''}`} onClick={() => setPeriodo(dias)}>{dias} dias</button>)}</div><button type="button" className={estilos.botaoSecundario} onClick={exportarCsv} disabled={!podeExportar}><Download size={16} aria-hidden="true" /> CSV</button><button type="button" className={estilos.botaoPrimario} onClick={imprimirRelatorio} disabled={!podeExportar}><Printer size={16} aria-hidden="true" /> PDF</button></div>
    </header>

    {estado === 'carregando' && <div className={estilos.esqueletoRelatorio} role="status"><span>Preparando seu relatório. O primeiro carregamento pode levar alguns segundos…</span><div className={estilos.gradeResumo}>{METRICAS.map(([chave]) => <i key={chave} className={estilos.esqueletoMetrica} />)}</div><div className={estilos.esqueletoGraficos}><i className={estilos.esqueletoCartao} /><i className={estilos.esqueletoCartao} /></div></div>}
    {(estado === 'erro' || estado === 'offline') && <div className={estilos.estadoProblema} role="alert"><h3>{estado === 'offline' ? 'Você está offline' : 'Não foi possível gerar o relatório'}</h3><p>{estado === 'offline' ? 'Reconecte-se para consultar dados atualizados e exportar com segurança.' : 'O backend pode estar iniciando. Aguarde alguns segundos e tente novamente.'}</p><button type="button" className={estilos.botaoSecundario} onClick={() => setTentativa((valor) => valor + 1)}><RefreshCw size={16} aria-hidden="true" /> Tentar novamente</button></div>}
    {estado === 'pronto' && !temDados && <div className={estilos.cartaoVazio}><h3>Sem dados neste período</h3><p>Registre refeições, água, peso ou sessões de treino para formar comparações confiáveis.</p><div className={estilos.linksVazio}><Link to="/dashboard/dieta">Abrir Dieta</Link><Link to="/dashboard/evolucao">Abrir Evolução</Link><Link to="/dashboard/treino">Abrir Treino</Link></div></div>}

    {estado === 'pronto' && temDados && <><div className={estilos.gradeResumo}>{METRICAS.map(([chave, rotulo, unidade]) => { const atual = relatorio.atual[chave]; const comparacao = calcularComparacao(atual, relatorio.anterior[chave]); return <article key={chave}><span>{rotulo}</span><strong>{atual == null ? 'Dados insuficientes' : `${formatarNumeroRelatorio(atual)}${unidade ? ` ${unidade}` : ''}`}</strong><small>{comparacao == null ? 'Sem base no período anterior' : `${comparacao > 0 ? '+' : ''}${formatarNumeroRelatorio(comparacao)}% vs. período anterior`}</small></article>; })}</div>
      <div className={estilos.gradeGraficos}>
        <article className={estilos.cartao}><h3 className={estilos.cartaoTitulo}>Calorias por dia (kcal)</h3>{relatorio.serie.some((item) => item.calorias > 0) ? <div className={estilos.grafico}><ResponsiveContainer width="100%" height={240}><BarChart data={relatorio.serie}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="data" tickFormatter={formatarData} /><YAxis /><Tooltip labelFormatter={formatarData} formatter={(valor) => [`${valor} kcal`, 'Calorias']} /><Bar dataKey="calorias" fill="var(--brand)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className={estilos.vazioGrafico}>Nenhuma refeição registrada. <Link to="/dashboard/dieta">Registrar alimentação</Link></p>}</article>
        <article className={estilos.cartao}><h3 className={estilos.cartaoTitulo}>Evolução do peso (kg)</h3>{seriePeso.length >= 2 ? <div className={estilos.grafico}><ResponsiveContainer width="100%" height={240}><LineChart data={seriePeso}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="data" tickFormatter={formatarData} /><YAxis domain={['dataMin - 1', 'dataMax + 1']} /><Tooltip labelFormatter={formatarData} formatter={(valor) => [`${formatarNumeroRelatorio(valor)} kg`, 'Peso']} /><Line type="monotone" dataKey="peso" stroke="var(--brand)" strokeWidth={3} /></LineChart></ResponsiveContainer></div> : <p className={estilos.vazioGrafico}>São necessários dois pesos no período. <Link to="/dashboard/evolucao">Registrar peso</Link></p>}</article>
        <article className={estilos.cartao}><h3 className={estilos.cartaoTitulo}>Volume por grupo muscular (kg)</h3>{relatorio.volumePorGrupo.length ? <ul className={estilos.listaVolume}>{relatorio.volumePorGrupo.map((item) => <li key={item.grupoMuscular}><span>{item.grupoMuscular}</span><strong>{formatarNumeroRelatorio(item.volumeKg)} kg</strong></li>)}</ul> : <p className={estilos.vazioGrafico}>Conclua séries com carga para calcular o volume. <Link to="/dashboard/treino">Abrir treino</Link></p>}</article>
      </div></>}
  </section>;
}
