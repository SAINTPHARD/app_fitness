import CartaoMetrica from './components/CartaoMetrica';
import CartaoMetaDoDia from './components/CartaoMetaDoDia';
import CartaoProximoTreino from './components/CartaoProximoTreino';
import CardTimelineDieta from './components/CardTimelineDieta';
import CartaoSequencia from './components/CartaoSequencia';
import GraficoSemanal from './components/GraficoSemanal';
import GraficoEvolucaoPeso from './components/GraficoEvolucaoPeso';
import EsqueletoHome from './components/EsqueletoHome';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import { useResumoNutricionalHoje } from './hooks/useResumoNutricionalHoje';
import estilos from './Home.module.css';

export default function HomePage() {
  const { perfil, carregando, imc, classificacaoImc, historicoPeso, variacaoPeso } = usePerfilResumo();
  const { metas, totaisDoDia, percentuais, metaDoDiaPercentual, agua, refeicoesDoDia } =
    useResumoNutricionalHoje();

  // Blindagem de UI: enquanto o perfil ainda está sendo buscado no backend,
  // mostramos o esqueleto em vez de cartões zerados/piscando.
  if (carregando) {
    return <EsqueletoHome />;
  }

  return (
    <section className={estilos.pagina}>
      <div className={estilos.heroCard}>
        <div>
          <span className={estilos.label}>Visão Geral</span>
          <h2 className={estilos.titulo}>Seu progresso em um só lugar</h2>
          <p className={estilos.subtitulo}>
            Resumo do seu dia: nutrição, hidratação, peso e o que vem a seguir na sua rotina.
          </p>
        </div>
        <div className={estilos.heroStatus}>
          <span>Modo Fitness</span>
          <strong>Ativo</strong>
        </div>
      </div>

      {/* Resumo do dia: calorias, macros, água (dados reais da Dieta) + peso/IMC (dados reais do Perfil). */}
      <div className={estilos.gradeMetricas}>
        <CartaoMetrica
          emoji="🔥"
          rotulo="Calorias"
          valorPrincipal={totaisDoDia.calorias}
          valorSecundario={`/ ${metas.calorias || 0} kcal`}
          percentual={percentuais.calorias}
          alerta={percentuais.calorias >= 100}
        />
        <CartaoMetrica
          emoji="💪"
          rotulo="Proteína"
          valorPrincipal={`${totaisDoDia.proteina}g`}
          valorSecundario={`/ ${metas.proteinas || 0}g`}
          percentual={percentuais.proteina}
        />
        <CartaoMetrica
          emoji="🍚"
          rotulo="Carboidratos"
          valorPrincipal={`${totaisDoDia.carboidratos}g`}
          valorSecundario={`/ ${metas.carboidratos || 0}g`}
          percentual={percentuais.carboidratos}
        />
        <CartaoMetrica
          emoji="🥑"
          rotulo="Gordura"
          valorPrincipal={`${totaisDoDia.gordura}g`}
          valorSecundario={`/ ${metas.gorduras || 0}g`}
          percentual={percentuais.gordura}
        />
        <CartaoMetrica
          emoji="💧"
          rotulo="Água"
          valorPrincipal={`${(agua.totalMl / 1000).toFixed(1)}L`}
          valorSecundario={`/ ${(agua.metaMl / 1000).toFixed(1)}L`}
          percentual={percentuais.agua}
        />
        <CartaoMetrica emoji="⚖️" rotulo="Peso atual" valorPrincipal={perfil?.peso ? `${perfil.peso} kg` : '---'} />
        <CartaoMetrica emoji="📏" rotulo="IMC" valorPrincipal={imc ?? '---'} valorSecundario={classificacaoImc} />
      </div>

      {/* Widgets de ação rápida: o que vem a seguir e como o dia está indo. */}
      <div className={estilos.gradeWidgets}>
        <CartaoProximoTreino />
        <CardTimelineDieta refeicoes={refeicoesDoDia} />
        <CartaoMetaDoDia percentual={metaDoDiaPercentual} />
        <CartaoSequencia />
      </div>

      {/* Gráficos: tendência semanal de calorias e evolução do peso. */}
      <div className={estilos.gradeGraficos}>
        <GraficoSemanal />
        <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} />
      </div>
    </section>
  );
}
