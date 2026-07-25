import { Plus, X } from 'lucide-react';

/**
 * Botão flutuante (FAB) fixo no canto inferior direito para criar uma nova
 * refeição — substitui o antigo botão inline no cabeçalho da lista, ficando
 * acessível de qualquer ponto de rolagem da página.
 */
export default function BotaoFlutuanteNovaRefeicao({ aberto, aoAlternar }) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-label={aberto ? 'Fechar formulário de nova refeição' : 'Nova refeição'}
      className="fixed bottom-8 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-zinc-900 shadow-xl shadow-lime-400/40 transition-transform hover:scale-105 active:scale-95"
    >
      {aberto ? <X size={24} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={2.5} />}
    </button>
  );
}
