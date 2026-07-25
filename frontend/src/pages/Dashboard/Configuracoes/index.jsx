import { useTema } from '../../../hooks/useTema';
import estilos from './Configuracoes.module.css';

/**
 * Página Configurações — por enquanto só o tema claro/escuro é uma
 * preferência real (persistida via `useTema`). Idioma, notificações e plano
 * ficam sinalizados como "em breve" em vez de controles que não fazem nada.
 */
export default function ConfiguracoesPage() {
  const { ehEscuro, alternarTema } = useTema();

  return (
    <section className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <p className={estilos.eyebrow}>Configurações</p>
        <h2 className={estilos.titulo}>Preferências do app</h2>
        <p className={estilos.subtitulo}>Ajustes de aparência e conta.</p>
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

      <div className={estilos.cartao}>
        <h3 className={estilos.cartaoTitulo}>Conta</h3>

        <div className={`${estilos.linha} ${estilos.linhaDesabilitada}`}>
          <div>
            <p className={estilos.linhaLabel}>Idioma</p>
            <p className={estilos.linhaDescricao}>Português (Brasil)</p>
          </div>
          <span className={estilos.badgeEmBreve}>Em breve</span>
        </div>

        <div className={`${estilos.linha} ${estilos.linhaDesabilitada}`}>
          <div>
            <p className={estilos.linhaLabel}>Notificações</p>
            <p className={estilos.linhaDescricao}>Lembretes de água, refeições e treinos.</p>
          </div>
          <span className={estilos.badgeEmBreve}>Em breve</span>
        </div>

        <div className={`${estilos.linha} ${estilos.linhaDesabilitada}`}>
          <div>
            <p className={estilos.linhaLabel}>Plano</p>
            <p className={estilos.linhaDescricao}>Gerenciar assinatura Pro.</p>
          </div>
          <span className={estilos.badgeEmBreve}>Em breve</span>
        </div>
      </div>
    </section>
  );
}
