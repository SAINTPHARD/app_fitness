import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { obterEmojiAlimento, obterEmojiRefeicao, PALETA_FUNDO_ICONE } from '../utils/emojiAlimento';
import { calcularCaloriasPelosMacros, somarMacrosDeAlimentos } from '../utils/macros';
import { calcularMacrosProporcionais } from '../utils/tabelaAlimentos';
import { metaExcedida } from '../utils/progresso';
import BuscaAlimento from './BuscaAlimento';

const RASCUNHO_VAZIO = { nome: '', quantidade: '', proteina: '', carboidratos: '', gordura: '', alimentoRef: null };

// Função utilitária para arredondar para no máximo 1 casa decimal e evitar dízimas periódicas no JS
const arredondar1Casa = (valor) => {
  const num = Number(valor);
  if (isNaN(num)) return 0;
  return Math.round(num * 10) / 10;
};

export default function CartaoRefeicao({
  refeicao,
  metas,
  expandida,
  aoAlternarExpandida,
  aoAdicionarAlimento,
  aoRemoverAlimento,
  aoEditarAlimento,
}) {
  const [novoAlimento, setNovoAlimento] = useState(RASCUNHO_VAZIO);
  const [indiceEmEdicao, setIndiceEmEdicao] = useState(null);
  const [rascunhoEdicao, setRascunhoEdicao] = useState(RASCUNHO_VAZIO);

  // Recalcula totais e arredonda os resultados
  const totaisDaRefeicao = useMemo(() => {
    const brutos = somarMacrosDeAlimentos(refeicao?.alimentos);
    return {
      calorias: Math.round(brutos.calorias || 0),
      proteina: arredondar1Casa(brutos.proteina),
      carboidratos: arredondar1Casa(brutos.carboidratos),
      gordura: arredondar1Casa(brutos.gordura),
    };
  }, [refeicao?.alimentos]);

  const excedeuAlgumaMeta =
    metaExcedida(totaisDaRefeicao.calorias, metas.calorias) ||
    metaExcedida(totaisDaRefeicao.proteina, metas.proteinas) ||
    metaExcedida(totaisDaRefeicao.carboidratos, metas.carboidratos) ||
    metaExcedida(totaisDaRefeicao.gordura, metas.gorduras);

  if (!refeicao) return null;

  const jaTemAlimento = refeicao.alimentos && refeicao.alimentos.length > 0;

  const montarAlimento = (rascunho, idExistente) => {
    const proteinaNumerica = arredondar1Casa(rascunho.proteina);
    const carboidratosNumericos = arredondar1Casa(rascunho.carboidratos);
    const gorduraNumerica = arredondar1Casa(rascunho.gordura);

    return {
      id: idExistente ?? Date.now(),
      nome: rascunho.nome.trim(),
      quantidade: String(rascunho.quantidade).trim(),
      calorias: calcularCaloriasPelosMacros(proteinaNumerica, carboidratosNumericos, gorduraNumerica),
      proteina: proteinaNumerica,
      carboidratos: carboidratosNumericos,
      gordura: gorduraNumerica,
    };
  };

  const lidarComEnvioNovoAlimento = (evento) => {
    evento.preventDefault();
    if (!novoAlimento.nome.trim()) return;

    aoAdicionarAlimento(refeicao.id, montarAlimento(novoAlimento));
    setNovoAlimento(RASCUNHO_VAZIO);
  };

  const iniciarEdicao = (indice, alimento) => {
    setIndiceEmEdicao(indice);
    setRascunhoEdicao({
      nome: alimento.nome,
      quantidade: alimento.quantidade || '',
      proteina: String(arredondar1Casa(alimento.proteina)),
      carboidratos: String(arredondar1Casa(alimento.carboidratos)),
      gordura: String(arredondar1Casa(alimento.gordura)),
      alimentoRef: null,
    });
  };

  const selecionarAlimentoRef = (setRascunho) => (alimentoRef) => {
    setRascunho((prev) => {
      const quantidadeNumerica = Number(prev.quantidade);
      const macros = quantidadeNumerica > 0 ? calcularMacrosProporcionais(alimentoRef, quantidadeNumerica) : null;

      return {
        ...prev,
        nome: alimentoRef.nome,
        alimentoRef,
        ...(macros && {
          proteina: String(arredondar1Casa(macros.proteina)),
          carboidratos: String(arredondar1Casa(macros.carboidratos)),
          gordura: String(arredondar1Casa(macros.gordura)),
        }),
      };
    });
  };

  const alterarQuantidade = (setRascunho) => (quantidade) => {
    setRascunho((prev) => {
      if (!prev.alimentoRef) return { ...prev, quantidade };

      const quantidadeNumerica = Number(quantidade) || 0;
      const macros = calcularMacrosProporcionais(prev.alimentoRef, quantidadeNumerica);

      return {
        ...prev,
        quantidade,
        proteina: String(arredondar1Casa(macros.proteina)),
        carboidratos: String(arredondar1Casa(macros.carboidratos)),
        gordura: String(arredondar1Casa(macros.gordura)),
      };
    });
  };

  const salvarEdicao = (evento, indice, idAlimento) => {
    evento.preventDefault();
    if (!rascunhoEdicao.nome.trim()) return;

    aoEditarAlimento(refeicao.id, idAlimento, montarAlimento(rascunhoEdicao, idAlimento));
    setIndiceEmEdicao(null);
  };

  return (
    <article
      className={[
        'rounded-3xl bg-white shadow-xl shadow-slate-200/50 transition-all dark:bg-zinc-800 dark:shadow-none',
        excedeuAlgumaMeta ? 'ring-2 ring-rose-300' : '',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={aoAlternarExpandida}
        aria-expanded={expandida}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">
            {obterEmojiRefeicao(refeicao.nome)}
          </span>
          <span className="font-bold text-slate-800 dark:text-zinc-50">{refeicao.nome}</span>
        </span>

        <span className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500">{refeicao.horario}</span>
          <span
            className={[
              'flex h-6 w-6 items-center justify-center rounded-full border-2',
              jaTemAlimento
                ? 'border-lime-400 bg-lime-400 text-zinc-900'
                : 'border-slate-200 text-transparent dark:border-zinc-600',
            ].join(' ')}
          >
            <Check size={13} strokeWidth={3} />
          </span>
        </span>
      </button>

      {expandida && (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 pb-5 pt-4 dark:border-zinc-700">
          {excedeuAlgumaMeta && (
            <span className="w-fit rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">
              Acima da meta
            </span>
          )}

          {/* Resumo de Macros no Topo da Refeição */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center dark:bg-zinc-900/40">
              <strong className="block text-sm font-bold text-slate-800 dark:text-zinc-50">
                {totaisDaRefeicao.proteina}g
              </strong>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Proteína</span>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center dark:bg-zinc-900/40">
              <strong className="block text-sm font-bold text-slate-800 dark:text-zinc-50">
                {totaisDaRefeicao.carboidratos}g
              </strong>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Carbo</span>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center dark:bg-zinc-900/40">
              <strong className="block text-sm font-bold text-slate-800 dark:text-zinc-50">
                {totaisDaRefeicao.gordura}g
              </strong>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Gordura</span>
            </div>
          </div>

          {/* Lista de Alimentos Salvos */}
          {jaTemAlimento ? (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {refeicao.alimentos.map((alimento, indice) => {
                if (indiceEmEdicao === indice) {
                  return (
                    <li key={alimento.id ?? `${alimento.nome}-${indice}`}>
                      <form
                        onSubmit={(evento) => salvarEdicao(evento, indice, alimento.id)}
                        className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-900/40"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <BuscaAlimento
                            valor={rascunhoEdicao.nome}
                            aoDigitar={(nome) => setRascunhoEdicao((prev) => ({ ...prev, nome, alimentoRef: null }))}
                            aoSelecionar={selecionarAlimentoRef(setRascunhoEdicao)}
                          />
                          <input
                            type="text"
                            placeholder="Quantidade (ex: 150)"
                            value={rascunhoEdicao.quantidade}
                            onChange={(e) => alterarQuantidade(setRascunhoEdicao)(e.target.value)}
                            className="col-span-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Prot"
                            step="0.1"
                            value={rascunhoEdicao.proteina}
                            onChange={(e) => setRascunhoEdicao((prev) => ({ ...prev, proteina: e.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                          <input
                            type="number"
                            placeholder="Carb"
                            step="0.1"
                            value={rascunhoEdicao.carboidratos}
                            onChange={(e) => setRascunhoEdicao((prev) => ({ ...prev, carboidratos: e.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                          <input
                            type="number"
                            placeholder="Gord"
                            step="0.1"
                            value={rascunhoEdicao.gordura}
                            onChange={(e) => setRascunhoEdicao((prev) => ({ ...prev, gordura: e.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                        <span className="w-fit rounded-full bg-lime-50 px-2.5 py-1 text-xs font-bold text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">
                          Prévia: {calcularCaloriasPelosMacros(rascunhoEdicao.proteina, rascunhoEdicao.carboidratos, rascunhoEdicao.gordura)} kcal
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 rounded-lg bg-zinc-900 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] dark:bg-lime-400 dark:text-zinc-900"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setIndiceEmEdicao(null)}
                            className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-300 dark:bg-zinc-700 dark:text-zinc-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </li>
                  );
                }

                return (
                  <li
                    key={alimento.id ?? `${alimento.nome}-${indice}`}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${PALETA_FUNDO_ICONE[indice % PALETA_FUNDO_ICONE.length]}`}
                      >
                        {obterEmojiAlimento(alimento.nome)}
                      </span>
                      <div>
                        <p className="m-0 text-sm font-semibold text-slate-700 dark:text-zinc-200">{alimento.nome}</p>
                        {alimento.quantidade && (
                          <p className="m-0 text-xs text-slate-400 dark:text-zinc-500">{alimento.quantidade}g/un</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-sm font-bold text-slate-500 dark:text-zinc-400">
                        {alimento.calorias > 0 ? `${alimento.calorias} kcal` : '—'}
                      </span>
                      {aoEditarAlimento && (
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                          onClick={() => iniciarEdicao(indice, alimento)}
                          aria-label={`Editar ${alimento.nome}`}
                        >
                          <Pencil size={12} strokeWidth={2.5} />
                        </button>
                      )}
                      {aoRemoverAlimento && (
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-500 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                          onClick={() => aoRemoverAlimento(refeicao.id, alimento.id)}
                          aria-label={`Remover ${alimento.nome}`}
                        >
                          <X size={13} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">Nenhum alimento registrado</p>
          )}

          {/* Form para Adicionar Novo Alimento */}
          <form onSubmit={lidarComEnvioNovoAlimento} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/40">
            <h4 className="m-0 text-sm font-bold text-slate-600 dark:text-zinc-300">Novo alimento</h4>
            <div className="grid grid-cols-2 gap-2">
              <BuscaAlimento
                valor={novoAlimento.nome}
                aoDigitar={(nome) => setNovoAlimento((prev) => ({ ...prev, nome, alimentoRef: null }))}
                aoSelecionar={selecionarAlimentoRef(setNovoAlimento)}
              />
              <input
                type="text"
                placeholder="Quantidade (ex: 150)"
                value={novoAlimento.quantidade}
                onChange={(e) => alterarQuantidade(setNovoAlimento)(e.target.value)}
                className="col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            
            {/* INPUTS DE MACROS RESTAURADOS AQUI: */}
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Prot"
                step="0.1"
                value={novoAlimento.proteina}
                onChange={(e) => setNovoAlimento((prev) => ({ ...prev, proteina: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="number"
                placeholder="Carb"
                step="0.1"
                value={novoAlimento.carboidratos}
                onChange={(e) => setNovoAlimento((prev) => ({ ...prev, carboidratos: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="number"
                placeholder="Gord"
                step="0.1"
                value={novoAlimento.gordura}
                onChange={(e) => setNovoAlimento((prev) => ({ ...prev, gordura: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <span className="w-fit rounded-full bg-lime-50 px-2.5 py-1 text-xs font-bold text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">
              Prévia: {calcularCaloriasPelosMacros(novoAlimento.proteina, novoAlimento.carboidratos, novoAlimento.gordura)} kcal
            </span>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] dark:bg-lime-400 dark:text-zinc-900"
            >
              <Plus size={14} strokeWidth={2.5} /> Adicionar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}