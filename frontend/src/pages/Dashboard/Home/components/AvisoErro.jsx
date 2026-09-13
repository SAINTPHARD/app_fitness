import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Faixa de erro recuperável dos cartões da Home. Antes o erro do resumo
 * nutricional era só um texto: o usuário via "não foi possível carregar" e
 * ficava sem saída a não ser recarregar a página inteira. Aqui a mensagem
 * vem sempre acompanhada da ação de tentar de novo, que refaz apenas as
 * chamadas que falharam.
 */
export default function AvisoErro({ mensagem, aoTentarNovamente, tentando = false }) {
  if (!mensagem) return null;

  return (
    <div
      role="alert"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
    >
      <span className="inline-flex items-center gap-2">
        <AlertCircle size={16} strokeWidth={2.5} aria-hidden="true" />
        {mensagem}
      </span>
      {aoTentarNovamente && (
        <button
          type="button"
          onClick={aoTentarNovamente}
          disabled={tentando}
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-200 disabled:opacity-60 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25"
        >
          <RefreshCw size={12} strokeWidth={3} className={tentando ? 'animate-spin' : undefined} aria-hidden="true" />
          {tentando ? 'Tentando...' : 'Tentar novamente'}
        </button>
      )}
    </div>
  );
}

AvisoErro.propTypes = {
  mensagem: PropTypes.string,
  aoTentarNovamente: PropTypes.func,
  tentando: PropTypes.bool,
};
