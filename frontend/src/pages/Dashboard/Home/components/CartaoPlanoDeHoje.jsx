import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Plus, Undo2 } from 'lucide-react';
import BlocoMacro from './BlocoMacro';
import AvisoErro from './AvisoErro';
import { montarBlocosMacro } from '../utils/blocosMacro';
import { obterRotuloObjetivo } from '../utils/objetivo';
import { useRegistroDeAgua } from '../hooks/useRegistroDeAgua';

/**
 * Cartão de topo da Home: o estado do dia em uma olhada (calorias, macros e
 * água) mais os dois atalhos que o usuário mais usa daqui — registrar uma
 * refeição (leva à Dieta) e registrar um copo de água (feito no próprio
 * cartão). Toda a montagem dos blocos vem de `montarBlocosMacro`, então este
 * componente cuida só de layout e interação.
 */
export default function CartaoPlanoDeHoje({ resumo, objetivo, aoRecarregar, recarregando }) {
  const { metas, totaisDoDia, percentuais, agua, erro, adicionarAgua, removerAgua } = resumo;
  const { podeDesfazer, pendente, anuncio, registrarCopo, desfazerCopo, mlPorCopo } = useRegistroDeAgua(
    adicionarAgua,
    removerAgua
  );

  const rotuloObjetivo = obterRotuloObjetivo(objetivo);
  const blocos = montarBlocosMacro({ totaisDoDia, metas, percentuais, agua });

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="m-0 text-lg font-bold text-content">Continue no seu plano</h2>
          {rotuloObjetivo && (
            <span className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-ink">
              Meta calculada para {rotuloObjetivo}
            </span>
          )}
        </div>
        <Link
          to="/dashboard/dieta"
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Registrar refeição →
        </Link>
      </div>

      <AvisoErro mensagem={erro} aoTentarNovamente={aoRecarregar} tentando={recarregando} />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {blocos.map(({ chave, ...bloco }) => (
          <BlocoMacro key={chave} {...bloco}>
            {chave === 'agua' && (
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={registrarCopo}
                  disabled={pendente}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[11px] font-bold text-brand-soft-ink transition-colors hover:bg-brand/90 hover:text-brand-ink disabled:opacity-60"
                >
                  <Plus size={11} strokeWidth={3} aria-hidden="true" /> {mlPorCopo} ml
                </button>
                {podeDesfazer && (
                  <button
                    type="button"
                    onClick={desfazerCopo}
                    disabled={pendente}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-subtle transition-colors hover:text-secondary disabled:opacity-60"
                  >
                    <Undo2 size={11} strokeWidth={2.5} aria-hidden="true" /> Desfazer
                  </button>
                )}
              </div>
            )}
          </BlocoMacro>
        ))}
      </div>

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{anuncio}</span>
    </article>
  );
}

CartaoPlanoDeHoje.propTypes = {
  resumo: PropTypes.shape({
    metas: PropTypes.object.isRequired,
    totaisDoDia: PropTypes.object.isRequired,
    percentuais: PropTypes.object.isRequired,
    agua: PropTypes.shape({ totalMl: PropTypes.number, metaMl: PropTypes.number }).isRequired,
    erro: PropTypes.string,
    adicionarAgua: PropTypes.func.isRequired,
    removerAgua: PropTypes.func.isRequired,
  }).isRequired,
  objetivo: PropTypes.string,
  aoRecarregar: PropTypes.func,
  recarregando: PropTypes.bool,
};
