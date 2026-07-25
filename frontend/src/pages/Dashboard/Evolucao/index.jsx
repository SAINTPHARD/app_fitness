import GraficoEvolucaoPeso from '../Home/components/GraficoEvolucaoPeso';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import estilos from './Evolucao.module.css';

// Itens ainda não implementados desta página (rodadas futuras do roadmap):
// medidas corporais, % de gordura e fotos de progresso precisam de novos
// campos no backend que ainda não existem.
const METRICAS_EM_BREVE = ['% de gordura corporal', 'Medidas (cintura, braço, perna...)', 'Fotos de progresso'];

/**
 * Página Evolução — por enquanto mostra o gráfico de peso real (mesmo
 * histórico local usado na Home e na Dieta, via `usePerfilResumo`) e sinaliza
 * claramente o que ainda está por vir, em vez de simular dados que o app
 * ainda não coleta.
 */
export default function EvolucaoPage() {
  const { historicoPeso, variacaoPeso, carregando } = usePerfilResumo();

  return (
    <section className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <p className={estilos.eyebrow}>Evolução</p>
        <h2 className={estilos.titulo}>Sua jornada ao longo do tempo</h2>
        <p className={estilos.subtitulo}>Acompanhe a evolução do seu peso — mais métricas chegam em breve.</p>
      </div>

      {!carregando && <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} />}

      <div className={estilos.cartao}>
        <h3 className={estilos.cartaoTitulo}>Em breve</h3>
        <div className={estilos.gradeEmBreve}>
          {METRICAS_EM_BREVE.map((metrica) => (
            <div key={metrica} className={estilos.itemEmBreve}>
              {metrica}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
