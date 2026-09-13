import { Plus, X } from 'lucide-react';
import PropTypes from 'prop-types';

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
      className="fixed bottom-8 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-ink shadow-xl transition-transform hover:scale-105 active:scale-95"
    >
      {aberto ? <X size={24} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={2.5} />}
    </button>
  );
}

BotaoFlutuanteNovaRefeicao.propTypes = { aberto: PropTypes.bool.isRequired, aoAlternar: PropTypes.func.isRequired };
