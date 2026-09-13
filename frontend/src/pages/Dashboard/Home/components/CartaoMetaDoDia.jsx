import PropTypes from 'prop-types';
import estilos from './CartaoMetaDoDia.module.css';

/**
 * Resumo único de "como estou indo hoje": a média dos percentuais de
 * calorias, água e macros já atingidos (ver `useResumoNutricionalHoje`).
 * Dá ao usuário uma resposta direta sem precisar somar os cartões um a um.
 */
export default function CartaoMetaDoDia({ percentual, faltam = [] }) {
  return (
    <article className={estilos.cartao}>
      <p className={estilos.rotulo}>Meta do dia</p>
      <p className={estilos.percentual}>{percentual}%</p>
      <div className={estilos.barra}>
        <div className={estilos.barraPreenchida} style={{ width: `${Math.min(percentual, 100)}%` }} />
      </div>
      <p className={estilos.legenda}>Baseado em calorias, água e macros de hoje</p>
      <p className={estilos.faltam}>{faltam.length ? `Para avançar: ${faltam.join(', ')}.` : 'Todas as metas configuradas foram alcançadas.'}</p>
    </article>
  );
}

CartaoMetaDoDia.propTypes = {
  percentual: PropTypes.number.isRequired,
  faltam: PropTypes.arrayOf(PropTypes.string),
};
