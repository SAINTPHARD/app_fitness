import CartaoPlanoDeHoje from './components/CartaoPlanoDeHoje';
import CartaoProximoTreino from './components/CartaoProximoTreino';
import CardTimelineDieta from './components/CardTimelineDieta';
import GraficoEvolucaoPeso from './components/GraficoEvolucaoPeso';
import EsqueletoHome from './components/EsqueletoHome';
import AvisoErro from './components/AvisoErro';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import { useResumoNutricionalHoje } from './hooks/useResumoNutricionalHoje';

/**
 * Home do Dashboard. É só composição: cada bloco busca ou recebe os próprios
 * dados e cuida do próprio estado de interação. A lógica que antes se
 * acumulava aqui (montagem dos blocos de macro, formatação e o registro de
 * água) vive hoje em `utils/blocosMacro`, `utils/formatadores` e
 * `hooks/useRegistroDeAgua`.
 */
export default function HomePage() {
  const perfilResumo = usePerfilResumo();
  const resumoHoje = useResumoNutricionalHoje();

  const { carregando, historicoPeso, variacaoPeso, perfil, erro: erroPerfil } = perfilResumo;
  const { refeicoesDoDia, adicionarRefeicao, removerRefeicao } = resumoHoje;

  if (carregando || resumoHoje.carregando) return <EsqueletoHome />;

  return (
    <section className="flex flex-col gap-6">
      {/* O perfil alimenta a badge de objetivo e o gráfico de peso; quando
          ele falha os dados nutricionais ainda são válidos, então avisamos
          sem derrubar a página inteira. */}
      <AvisoErro
        mensagem={erroPerfil}
        aoTentarNovamente={perfilResumo.recarregar}
        tentando={perfilResumo.recarregando}
      />

      <CartaoPlanoDeHoje
        resumo={resumoHoje}
        objetivo={perfil?.objetivo}
        aoRecarregar={resumoHoje.recarregar}
        recarregando={resumoHoje.recarregando}
      />

      {/* Refeições (60%) + Treino e Evolução do peso (40%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CardTimelineDieta
            refeicoes={refeicoesDoDia}
            aoAdicionarRefeicao={adicionarRefeicao}
            aoRemoverRefeicao={removerRefeicao}
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <CartaoProximoTreino />
          <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} exibirCtaRegistro />
        </div>
      </div>
    </section>
  );
}
