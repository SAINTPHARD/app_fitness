import { useTema } from '../../../hooks/useTema';
import estilos from './Configuracoes.module.css';

/**
 * Página Configurações — preferência real de tema claro/escuro
 * (persistida via `useTema`).
 */
export default function ConfiguracoesPage() {
  const { ehEscuro, alternarTema } = useTema();

  return (
    <section className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <p className={estilos.eyebrow}>Configurações</p>
        <h2 className={estilos.titulo}>Preferências do app</h2>
        <p className={estilos.subtitulo}>Ajustes de aparência.</p>
      </div>

      <div className={estilos.cartao}>
        <h3 className={estilos.cartaoTitulo}>Aparência</h3>

        <div className={estilos.linha}>
          <div>
            <p className={estilos.linhaLabel}>Modo escuro</p>
            <p className={estilos.linhaDescricao}>Troca o tema claro pelo escuro em todo o app.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={ehEscuro}
            onClick={alternarTema}
            className={`${estilos.interruptor} ${ehEscuro ? estilos.interruptorAtivo : ''}`}
          >
            <span className={estilos.interruptorBolinha} />
          </button>
        </div>
      </div>
    </section>
  );
}
