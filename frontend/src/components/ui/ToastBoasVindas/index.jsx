import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

/**
 * Toast flutuante de boas-vindas exibido após o cadastro.
 *
 * Diferente do `ToastHost` global (que escuta o barramento de notificações e
 * trata erros de API), este é um componente controlado: quem renderiza decide
 * quando ele aparece e por quanto tempo. A barra inferior consome exatamente
 * `duracaoMs`, servindo de dica visual do tempo até o redirecionamento.
 *
 * A entrada é feita com transição de estado (sem keyframes), então não exige
 * nenhuma configuração extra no tailwind.config.js.
 */
export default function ToastBoasVindas({ mensagem, duracaoMs = 2200, titulo = 'Cadastro concluído' }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Um frame de atraso garante que o browser pinte o estado inicial antes
    // da transição — sem isso o toast simplesmente aparece pronto.
    const frame = requestAnimationFrame(() => setVisivel(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mensagem) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:top-6 sm:justify-end"
    >
      <div
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-500/40 bg-zinc-900 shadow-2xl shadow-emerald-950/40 transition-all duration-300 ease-out motion-reduce:transition-none ${
          visivel
            ? 'translate-y-0 opacity-100 sm:translate-x-0'
            : '-translate-y-3 opacity-0 sm:translate-y-0 sm:translate-x-6'
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30"
          >
            <Check size={18} strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">{titulo}</p>
            <p className="mt-1 text-sm font-medium leading-snug text-zinc-100">{mensagem}</p>
          </div>
        </div>

        <div className="h-1 w-full bg-white/10">
          <div
            style={{ transitionDuration: `${duracaoMs}ms` }}
            className={`h-full bg-emerald-500 transition-[width] ease-linear motion-reduce:transition-none ${
              visivel ? 'w-0' : 'w-full'
            }`}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

ToastBoasVindas.propTypes = {
  mensagem: PropTypes.string,
  duracaoMs: PropTypes.number,
  titulo: PropTypes.string,
};
