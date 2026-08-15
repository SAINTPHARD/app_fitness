import CartaoMetrica from './components/CartaoMetrica';
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
  const {
    metas,
    totaisDoDia,
    percentuais,
    metaDoDiaPercentual,
    agua,
    refeicoesDoDia,
    adicionarRefeicao,
    removerRefeicao,
  } = useResumoNutricionalHoje();

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
          valorPrincipal={formatarCalorias(totaisDoDia.calorias)}
          valorSecundario={`/ ${metas.calorias || 0} kcal`}
          percentual={percentuais.calorias}
          alerta={percentuais.calorias >= 100}
        />
        <CartaoMetrica
          emoji="💪"
          rotulo="Proteína"
          valorPrincipal={`${formatar1Casa(totaisDoDia.proteina)}g`}
          valorSecundario={`/ ${metas.proteinas || 0}g`}
          percentual={percentuais.proteina}
        />
        <CartaoMetrica
          emoji="🍚"
          rotulo="Carboidratos"
          valorPrincipal={`${formatar1Casa(totaisDoDia.carboidratos)}g`}
          valorSecundario={`/ ${metas.carboidratos || 0}g`}
          percentual={percentuais.carboidratos}
        />
        <CartaoMetrica
          emoji="🥑"
          rotulo="Gordura"
          valorPrincipal={`${formatar1Casa(totaisDoDia.gordura)}g`}
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
      </div>

      {/* Widgets de ação rápida: o que vem a seguir e como o dia está indo.
          Peso/IMC saíram daqui — ficam só na página de Perfil. */}
      <div className={estilos.gradeWidgets}>
        <CartaoProximoTreino />
        <CardTimelineDieta
          refeicoes={refeicoesDoDia}
          aoAdicionarRefeicao={adicionarRefeicao}
          aoRemoverRefeicao={removerRefeicao}
        />
        <CartaoMetaDoDia percentual={metaDoDiaPercentual} />
      </div>

      {/* Gráficos: tendência semanal de calorias e evolução do peso. */}
      <div className={estilos.gradeGraficos}>
        <GraficoSemanal />
        <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} aoRegistrarPeso={registrarPeso} />
      </div>
    </section>
  );
}
