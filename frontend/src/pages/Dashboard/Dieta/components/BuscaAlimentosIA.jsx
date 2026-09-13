import { useState } from 'react';
import PropTypes from 'prop-types';
import { Loader2, Search, Sparkles } from 'lucide-react';
import api from '../../../../services/api';
import { extrairMensagemErro } from '../../../../utils/erroApi';

const primeiroValor = (objeto, campos, padrao) => {
  const campo = campos.find((nomeCampo) => objeto?.[nomeCampo] !== undefined && objeto?.[nomeCampo] !== null);
  return campo ? objeto[campo] : padrao;
};

const normalizarResultado = (alimento) => ({
  nome: String(primeiroValor(alimento, ['nome', 'name'], 'Alimento sem nome')),
  porcao: String(primeiroValor(alimento, ['porcao', 'quantidade', 'serving'], '—')),
  calorias: Number(primeiroValor(alimento, ['calorias', 'calories', 'caloriesKcal'], 0)) || 0,
  proteinas: Number(primeiroValor(alimento, ['proteinas', 'proteina', 'protein', 'proteinG'], 0)) || 0,
  carboidratos: Number(primeiroValor(alimento, ['carboidratos', 'carbohydrate', 'carbohydrateG'], 0)) || 0,
  gorduras: Number(primeiroValor(alimento, ['gorduras', 'gordura', 'fat', 'fatG'], 0)) || 0,
  revisado: false,
});
 
/**
 * Busca alimentos e macronutrientes por texto livre via IA
 * (GET /api/alimentos/buscar?query=...), consumindo o Gemini como food
 * database inteligente no backend — ver `GeminiVisionService.buscarMacrosPorTexto`.
 *
 * O token JWT NÃO é anexado manualmente aqui: a instância `api`
 * (services/api.js) já tem um interceptor de request que lê
 * `localStorage.getItem('token')` e injeta `Authorization: Bearer <token>`
 * em toda chamada — reaproveitar essa instância (em vez de axios cru) evita
 * duplicar essa lógica de auth em cada componente novo.
 */
export default function BuscaAlimentosIA({ refeicoes = [], aoAdicionarAlimento }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [refeicaoSelecionadaId, setRefeicaoSelecionadaId] = useState('');
  const [adicionandoIndice, setAdicionandoIndice] = useState(null);
  const [fonte, setFonte] = useState('');

  const atualizarResultado = (indice, campo, valor) => {
    setResultados((atuais) => atuais.map((item, posicao) =>
      posicao === indice ? { ...item, [campo]: valor, revisado: campo === 'revisado' ? valor : false } : item));
  };

  const adicionarNaRefeicao = async (alimento, indice) => {
    if (!refeicaoSelecionadaId) {
      setErro('Selecione a refeição que receberá o alimento.');
      return;
    }
    if (!alimento.revisado) {
      setErro('Revise a porção e os nutrientes e confirme a revisão antes de adicionar.');
      return;
    }
    setAdicionandoIndice(indice);
    setErro('');
    try {
      await aoAdicionarAlimento(Number(refeicaoSelecionadaId), {
        nome: alimento.nome,
        quantidade: alimento.porcao,
        calorias: Number(alimento.calorias) || 0,
        proteina: Number(alimento.proteinas) || 0,
        carboidratos: Number(alimento.carboidratos) || 0,
        gordura: Number(alimento.gorduras) || 0,
      });
    } catch (error) {
      setErro(extrairMensagemErro(error, 'Não foi possível adicionar o alimento à refeição.'));
    } finally {
      setAdicionandoIndice(null);
    }
  };

  const buscarMacros = async (evento) => {
    evento.preventDefault();

    const textoBusca = query.trim();
    if (!textoBusca) {
      setErro('Descreva o que você comeu (ex: "100g de frango e 2 ovos").');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      // `silenciarErroGlobal` evita o toast global duplicado — este
      // componente já mostra o próprio erro inline.
      const response = await api.get('/api/alimentos/buscar', {
        params: { query: textoBusca },
        silenciarErroGlobal: true,
        timeout: 12000,
      });

      const dadosBrutos = Array.isArray(response.data) ? response.data : response.data?.resultados;
      const dados = Array.isArray(dadosBrutos) ? dadosBrutos.map(normalizarResultado) : [];
      setResultados(dados);
      setFonte(response.headers?.['x-food-source'] || 'não informada');

      if (dados.length === 0) {
        setErro('A IA não identificou nenhum alimento nesse texto. Tente descrever de outra forma.');
      }
    } catch (error) {
      setResultados([]);
      setFonte('');
      setErro(error?.code === 'ECONNABORTED'
        ? 'A busca excedeu 12 segundos. Tente novamente ou use a busca convencional da refeição.'
        : extrairMensagemErro(error, 'Não foi possível calcular os macros agora. Tente novamente.'));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
      aria-labelledby="busca-alimentos-ia-titulo"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-ink">
          <Sparkles size={18} strokeWidth={2} />
        </span>
        <div>
          <h3 id="busca-alimentos-ia-titulo" className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">
            Buscar alimentos com IA
          </h3>
          <p className="m-0 text-xs text-slate-400 dark:text-zinc-500">
            Primeiro consultamos o catálogo local; se necessário, usamos IA generativa.
          </p>
        </div>
      </div>

      <form onSubmit={buscarMacros} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="busca-alimentos-assistida">Descrição dos alimentos</label>
        <input
          id="busca-alimentos-assistida"
          type="text"
          value={query}
          onChange={(evento) => setQuery(evento.target.value)}
          placeholder='Ex: "100g de frango e 2 ovos"'
          disabled={carregando}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={carregando}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-brand-ink transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {carregando ? (
            <>
              <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
              Calculando com IA...
            </>
          ) : (
            <>
              <Search size={16} strokeWidth={2.5} />
              Calcular Macros
            </>
          )}
        </button>
      </form>

      {erro && (
        <p role="alert" className="m-0 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          {erro}
        </p>
      )}

      {resultados.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="m-0 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            Fonte: {fonte === 'catalogo-local' ? 'catálogo nutricional local' : fonte === 'ia-generativa' ? 'estimativa por IA generativa' : fonte}. Valores podem variar por marca, preparo e porção; revise antes de salvar.
          </p>
          {aoAdicionarAlimento && (
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-500 dark:text-zinc-400 sm:max-w-xs">
              Adicionar à refeição
              <select value={refeicaoSelecionadaId} onChange={(evento) => setRefeicaoSelecionadaId(evento.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                <option value="">Selecione uma refeição</option>
                {refeicoes.map((refeicao) => <option key={refeicao.id} value={refeicao.id}>{refeicao.nome}</option>)}
              </select>
            </label>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {resultados.map((alimento, indice) => (
            <article
              key={`${alimento.nome}-${indice}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="m-0 text-sm font-bold text-slate-800 dark:text-zinc-50">
                  {alimento.nome || 'Alimento sem nome'}
                </h4>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Porção
                  <input className="ml-2 w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    value={alimento.porcao} onChange={(e) => atualizarResultado(indice, 'porcao', e.target.value)} />
                </label>
              </div>

              <p className="m-0 text-lg font-bold text-slate-800 dark:text-zinc-50">
                {Math.round(Number(alimento.calorias) || 0)} <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">kcal</span>
              </p>

              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  P: {Number(alimento.proteinas ?? 0).toFixed(1)}g
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  C: {Number(alimento.carboidratos ?? 0).toFixed(1)}g
                </span>
                <span className="rounded-full bg-pink-100 px-2.5 py-1 text-pink-600 dark:bg-pink-500/10 dark:text-pink-300">
                  G: {Number(alimento.gorduras ?? 0).toFixed(1)}g
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {[
                  ['calorias', 'kcal'], ['proteinas', 'Proteína (g)'], ['carboidratos', 'Carboidrato (g)'], ['gorduras', 'Gordura (g)'],
                ].map(([campo, rotulo]) => <label key={campo} className="flex flex-col gap-1 text-slate-500 dark:text-zinc-400">{rotulo}
                  <input type="number" min="0" step="0.1" value={alimento[campo]}
                    onChange={(e) => atualizarResultado(indice, campo, e.target.value)}
                    className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </label>)}
              </div>
              <label className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-300">
                <input type="checkbox" checked={alimento.revisado} onChange={(e) => atualizarResultado(indice, 'revisado', e.target.checked)} />
                Revisei a porção e os valores antes de inserir.
              </label>

              {aoAdicionarAlimento && (
                <button
                  type="button"
                  onClick={() => adicionarNaRefeicao(alimento, indice)}
                  disabled={adicionandoIndice !== null || !alimento.revisado}
                  className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand py-2 text-xs font-bold text-brand-ink transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {adicionandoIndice === indice ? 'Adicionando...' : '➕ Adicionar à refeição'}
                </button>
              )}
            </article>
          ))}
          </div>
        </div>
      )}
    </section>
  );
}

BuscaAlimentosIA.propTypes = {
  refeicoes: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired, nome: PropTypes.string.isRequired })),
  aoAdicionarAlimento: PropTypes.func,
};
