import estilos from './CartaoMetrica.module.css';

/**
 * Cartão genérico de métrica do resumo do dia (calorias, água, proteína,
 * carboidratos, gordura, peso, IMC). Um único componente reaproveitado com
 * props diferentes em vez de duplicar praticamente o mesmo card 7 vezes.
 *
 * `percentual` é opcional: só desenhamos a barrinha de progresso quando ele
 * é informado (peso e IMC, por exemplo, não têm meta/progresso).
 */
export default function CartaoMetrica({ emoji, rotulo, valorPrincipal, valorSecundario, percentual, alerta }) {
  const mostrarBarra = typeof percentual === 'number';

  return (
    <article className={estilos.cartao}>
      <p className={estilos.rotulo}>
        <span className={estilos.emoji} aria-hidden="true">
          {emoji}
        </span>
        {rotulo}
      </p>
      <p className={estilos.valor}>
        {valorPrincipal}
        {valorSecundario && <span className={estilos.valorSecundario}> {valorSecundario}</span>}
      </p>
      {mostrarBarra && (
        <div className={estilos.barra}>
          <div
            className={`${estilos.barraPreenchida} ${alerta ? estilos.barraAlerta : ''}`}
            style={{ width: `${Math.min(percentual, 100)}%` }}
          />
        </div>
      )}
    </article>
  );
}
