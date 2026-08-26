import { Beef, Droplet, Flame, Plus, Wheat } from 'lucide-react';
import CartaoMetaDoDia from './components/CartaoMetaDoDia';
import CartaoProximoTreino from './components/CartaoProximoTreino';
import CardTimelineDieta from './components/CardTimelineDieta';
import GraficoSemanal from './components/GraficoSemanal';
import GraficoEvolucaoPeso from './components/GraficoEvolucaoPeso';
import EsqueletoHome from './components/EsqueletoHome';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import { useResumoNutricionalHoje } from './hooks/useResumoNutricionalHoje';
import estilos from './Home.module.css';

const formatar1Casa = (valor) => (Number(valor) || 0).toFixed(1);
const formatarCalorias = (valor) => String(Math.round(Number(valor) || 0));

export default function HomePage() {
  const { carregando, historicoPeso, variacaoPeso, registrarPeso } = usePerfilResumo();
  const { metas, totaisDoDia, percentuais, metaDoDiaPercentual, agua, refeicoesDoDia, adicionarAgua, adicionarRefeicao, removerRefeicao } = useResumoNutricionalHoje();

  if (carregando) return <EsqueletoHome />;

  const caloriasConsumidas = Math.round(Number(totaisDoDia.calorias) || 0);
  const metaCalorias = Math.round(Number(metas.calorias) || 0);
  const caloriasRestantes = Math.max(metaCalorias - caloriasConsumidas, 0);
  const quantidadeRefeicoes = refeicoesDoDia.length;
  const progressoCalorias = Math.min(Math.max(percentuais.calorias, 0), 100);
  const macros = [
    { rotulo: 'Proteína', Icone: Beef, consumido: totaisDoDia.proteina, meta: metas.proteinas },
    { rotulo: 'Carboidrato', Icone: Wheat, consumido: totaisDoDia.carboidratos, meta: metas.carboidratos },
    { rotulo: 'Gordura', Icone: Droplet, consumido: totaisDoDia.gordura, meta: metas.gorduras },
  ];

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecalhoDireto}>
        <h1>
          Restam hoje <strong>{formatarCalorias(caloriasRestantes)} kcal</strong> de {formatarCalorias(metaCalorias)}
          <span aria-hidden="true"> · </span>
          <span>{quantidadeRefeicoes} {quantidadeRefeicoes === 1 ? 'refeição registrada' : 'refeições registradas'}</span>
        </h1>
      </header>

      <div className={estilos.resumoNutricional}>
        <article className={estilos.cartaoCalorias}>
          <div className={estilos.rotuloComIcone}><Flame size={22} strokeWidth={2.5} aria-hidden="true" /><span>Calorias consumidas</span></div>
          <p className={estilos.valorCalorias}>{formatarCalorias(caloriasConsumidas)}<span> / {formatarCalorias(metaCalorias)} kcal</span></p>
          <div className={estilos.barraCalorias} role="progressbar" aria-label="Progresso de calorias" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressoCalorias}>
            <div className={`${estilos.barraCaloriasPreenchida} ${percentuais.calorias >= 100 ? estilos.barraAlerta : ''}`} style={{ width: `${Math.min(progressoCalorias, 100)}%` }} />
          </div>
        </article>

        <div className={estilos.linhaMacros}>
          {macros.map(({ rotulo, Icone, consumido, meta }) => (
            <div className={estilos.macro} key={rotulo}>
              <span className={estilos.macroRotulo}><Icone size={16} aria-hidden="true" /> {rotulo}</span>
              <strong>{formatar1Casa(consumido)}g</strong><small>de {meta || 0}g</small>
            </div>
          ))}
        </div>

        <article className={estilos.widgetAgua}>
          <div className={estilos.aguaInformacao}>
            <span className={estilos.aguaIcone}><Droplet size={20} aria-hidden="true" /></span>
            <div><span>Água</span><strong>{(agua.totalMl / 1000).toFixed(1)} L <small>de {(agua.metaMl / 1000).toFixed(1)} L</small></strong></div>
          </div>
          <button type="button" onClick={() => adicionarAgua(250)} className={estilos.botaoAgua}><Plus size={16} strokeWidth={3} aria-hidden="true" /> 250 ml</button>
        </article>
      </div>

      <div className={estilos.gradeWidgets}>
        <CartaoProximoTreino />
        <CardTimelineDieta refeicoes={refeicoesDoDia} aoAdicionarRefeicao={adicionarRefeicao} aoRemoverRefeicao={removerRefeicao} />
        <CartaoMetaDoDia percentual={metaDoDiaPercentual} />
      </div>
      <div className={estilos.gradeGraficos}>
        <GraficoSemanal />
        <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} aoRegistrarPeso={registrarPeso} />
      </div>
    </section>
  );
}
