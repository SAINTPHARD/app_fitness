import { useMemo } from 'react';
import { obterSequenciaDeDias } from '../../Dieta/utils/sequenciaDias';
import estilos from './CartaoSequencia.module.css';

/**
 * Gamificação sutil: quantos dias seguidos (incluindo hoje) o usuário
 * registrou pelo menos uma refeição — calculado a partir dos dados reais da
 * Dieta (`obterSequenciaDeDias`), nunca um contador artificial.
 */
export default function CartaoSequencia() {
  const sequencia = useMemo(() => obterSequenciaDeDias(), []);

  return (
    <article className={estilos.cartao}>
      <span className={estilos.emoji} aria-hidden="true">
        🔥
      </span>
      <p className={estilos.numero}>{sequencia}</p>
      <p className={estilos.legenda}>{sequencia === 1 ? 'dia seguido' : 'dias seguidos'}</p>
    </article>
  );
}
