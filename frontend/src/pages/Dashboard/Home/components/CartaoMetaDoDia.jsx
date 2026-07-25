import estilos from './CartaoMetaDoDia.module.css';

/**
 * Resumo único de "como estou indo hoje": a média dos percentuais de
 * calorias, água e macros já atingidos (ver `useResumoNutricionalHoje`).
 * Dá ao usuário uma resposta direta sem precisar somar os cartões um a um.
 */
export default function CartaoMetaDoDia({ percentual }) {
  return (
    <article className={estilos.cartao}>
      <p className={estilos.rotulo}>Meta do dia</p>
      <p className={estilos.percentual}>{percentual}%</p>
      <div className={estilos.barra}>
        <div className={estilos.barraPreenchida} style={{ width: `${Math.min(percentual, 100)}%` }} />
      </div>
      <p className={estilos.legenda}>Baseado em calorias, água e macros de hoje</p>
    </article>
  );
}
