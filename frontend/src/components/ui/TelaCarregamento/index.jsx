import PropTypes from 'prop-types';

/**
 * Tela de carregamento de página inteira, usada enquanto o App ainda não
 * sabe se existe sessão salva. O spinner é CSS puro (borda girando), então
 * não depende de nenhuma configuração extra no tailwind.config.js.
 */
export default function TelaCarregamento({ mensagem = 'Carregando…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-zinc-50 px-6 dark:bg-zinc-950"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-200 border-t-emerald-600 dark:border-zinc-700 dark:border-t-emerald-500"
        />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{mensagem}</p>
      </div>
    </div>
  );
}

TelaCarregamento.propTypes = {
  mensagem: PropTypes.string,
};
