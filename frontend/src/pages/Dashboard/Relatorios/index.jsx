import { FileBarChart } from 'lucide-react';
import estilos from './styles.module.css';

const FUNCIONALIDADES_PLANEJADAS = ['Filtro por semana/mês/ano', 'Exportação em PDF', 'Exportação em Excel', 'Comparação entre períodos'];

/**
 * Página Relatórios — ainda sem dados agregados nem exportação implementados
 * no backend. Em vez de simular números, deixamos um estado vazio honesto
 * com o que está planejado para as próximas rodadas.
 */
export default function RelatoriosPage() {
  return (
    <section className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <p className={estilos.eyebrow}>Relatórios</p>
        <h2 className={estilos.titulo}>Estatísticas e exportação</h2>
        <p className={estilos.subtitulo}>Filtros por período e exportação em PDF/Excel chegam em uma próxima rodada.</p>
      </div>

      <div className={estilos.cartaoVazio}>
        <span className={estilos.icone}>
          <FileBarChart size={26} strokeWidth={2} />
        </span>
        <h3>Ainda não há relatórios para exibir</h3>
        <p>Assim que essa funcionalidade for implementada, você poderá gerar relatórios comparando semanas, meses e anos.</p>
        <div className={estilos.listaFuncionalidades}>
          {FUNCIONALIDADES_PLANEJADAS.map((item) => (
            <span key={item} className={estilos.badge}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
