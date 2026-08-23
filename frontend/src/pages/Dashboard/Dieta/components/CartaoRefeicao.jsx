import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { obterEmojiAlimento, obterEmojiRefeicao, PALETA_FUNDO_ICONE } from '../utils/emojiAlimento';
import {
  calcularCaloriasPelosMacros,
  LIMITES_ALIMENTO,
  somarMacrosDeAlimentos,
  validarValoresAlimento,
} from '../utils/macros';
import { calcularMacrosProporcionais } from '../utils/tabelaAlimentos';
import { metaExcedida } from '../utils/progresso';
import { refeicaoConcluida } from '../utils/proximaRefeicao';
import { notificarSucesso } from '../../../../utils/notificacoes';
import BuscaAlimento from './BuscaAlimento';

const RASCUNHO_VAZIO = { nome: '', quantidade: '', proteina: '', carboidratos: '', gordura: '', alimentoRef: null };
const arredondar1Casa = (valor) => Number((Number(valor) || 0).toFixed(1));
const extrairQuantidadeNumerica = (valor) => Number(String(valor ?? '').match(/[0-9]+(?:[.,][0-9]+)?/)?.[0]?.replace(',', '.')) || 0;
const formatarQuantidade = (valor) => /^\s*[0-9]+(?:[.,][0-9]+)?\s*$/.test(String(valor ?? ''))
  ? `${String(valor).trim()}g`
  : String(valor ?? '').trim();

export default function CartaoRefeicao({
  refeicao,
  metas,
  expandida,
  aoAlternarExpandida,
  aoAdicionarAlimento,
  aoRemoverAlimento,
  aoEditarAlimento,
  aoEditarRefeicao,
  aoRemoverRefeicao,
  aoConcluir,
}) {
  const [novoAlimento, setNovoAlimento] = useState(RASCUNHO_VAZIO);
  const [indiceEmEdicao, setIndiceEmEdicao] = useState(null);
  const [rascunhoEdicao, setRascunhoEdicao] = useState(RASCUNHO_VAZIO);
  const [editandoRefeicao, setEditandoRefeicao] = useState(false);
  const [rascunhoRefeicao, setRascunhoRefeicao] = useState({ nome: refeicao?.nome || '', horario: refeicao?.horario || '' });
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);
  const [alimentosRascunho, setAlimentosRascunho] = useState([]);
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState(null);
  const [confirmandoExclusaoRefeicao, setConfirmandoExclusaoRefeicao] = useState(false);
  // Refeição já concluída: o formulário de "Novo alimento" fica escondido por
  // padrão (a refeição já está "fechada") e só aparece quando o usuário clica
  // explicitamente em "Adicionar alimento" — diferente do fluxo pendente, em
  // que o formulário já vem sempre visível dentro do card expandido.
  const [mostrarAdicionarAlimento, setMostrarAdicionarAlimento] = useState(false);
  const [adicionandoAlimento, setAdicionandoAlimento] = useState(false);
  const [erroValidacaoNovoAlimento, setErroValidacaoNovoAlimento] = useState(null);
  const [erroValidacaoEdicao, setErroValidacaoEdicao] = useState(null);

  const totaisDaRefeicao = useMemo(() => {
    const brutos = somarMacrosDeAlimentos([...(refeicao?.alimentos || []), ...alimentosRascunho]);
    return {
      calorias: Math.round(brutos.calorias || 0),
      proteina: arredondar1Casa(brutos.proteina),
      carboidratos: arredondar1Casa(brutos.carboidratos),
      gordura: arredondar1Casa(brutos.gordura),
    };
  }, [refeicao?.alimentos, alimentosRascunho]);

  const totaisRascunho = useMemo(() => {
    const brutos = somarMacrosDeAlimentos(alimentosRascunho);
    return {
      calorias: Math.round(brutos.calorias || 0),
      proteina: arredondar1Casa(brutos.proteina),
      carboidratos: arredondar1Casa(brutos.carboidratos),
      gordura: arredondar1Casa(brutos.gordura),
    };
  }, [alimentosRascunho]);

  if (!refeicao) return null;

  const concluida = refeicaoConcluida(refeicao);
  const jaTemAlimento = refeicao.alimentos && refeicao.alimentos.length > 0;
  const podeSalvar = alimentosRascunho.length > 0 || jaTemAlimento;
  const excedeuAlgumaMeta =
    metaExcedida(totaisDaRefeicao.calorias, metas?.calorias) ||
    metaExcedida(totaisDaRefeicao.proteina, metas?.proteinas) ||
    metaExcedida(totaisDaRefeicao.carboidratos, metas?.carboidratos) ||
    metaExcedida(totaisDaRefeicao.gordura, metas?.gorduras);

  const montarAlimento = (rascunho, idExistente) => {
    const proteinaNumerica = arredondar1Casa(rascunho.proteina);
    const carboidratosNumericos = arredondar1Casa(rascunho.carboidratos);
    const gorduraNumerica = arredondar1Casa(rascunho.gordura);

    return {
      ...(idExistente != null && { id: idExistente }),
      nome: String(rascunho.nome || '').trim(),
      quantidade: formatarQuantidade(rascunho.quantidade),
      calorias: calcularCaloriasPelosMacros(proteinaNumerica, carboidratosNumericos, gorduraNumerica),
      proteina: proteinaNumerica,
      carboidratos: carboidratosNumericos,
      gordura: gorduraNumerica,
    };
  };

  const validarAlimento = (rascunho) => {
    return validarValoresAlimento(rascunho);
  };

  const salvarRefeicao = async () => {
    if (!aoConcluir || concluida || salvando || !podeSalvar) return;
    setSalvando(true);
    setErroSalvar(null);

    try {
      let idAtual = refeicao.id;
      for (const alimento of alimentosRascunho) {
        const { tempId, ...alimentoParaEnviar } = alimento;
        idAtual = (await aoAdicionarAlimento(idAtual, alimentoParaEnviar)) ?? idAtual;
      }
      await aoConcluir(idAtual);
      setAlimentosRascunho([]);
    } catch (err) {
      console.error('Erro ao salvar refeição:', err);
      setErroSalvar('Não foi possível salvar a refeição. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarEdicaoRefeicao = async (evento) => {
    evento.preventDefault();
    if (!aoEditarRefeicao || !rascunhoRefeicao.nome.trim() || !rascunhoRefeicao.horario) return;

    setSalvando(true);
    setErroSalvar(null);
    try {
      await aoEditarRefeicao(refeicao.id, {
        ...refeicao,
        nome: rascunhoRefeicao.nome.trim(),
        horario: rascunhoRefeicao.horario,
      });
      setEditandoRefeicao(false);
    } catch (err) {
      console.error('Erro ao editar refeição:', err);
      setErroSalvar('Não foi possível editar a refeição.');
    } finally {
      setSalvando(false);
    }
  };

  const removerRefeicao = async () => {
    if (!aoRemoverRefeicao) return;
    setSalvando(true);
    setErroSalvar(null);
    try {
      await aoRemoverRefeicao(refeicao.id);
    } catch (err) {
      console.error('Erro ao remover refeição:', err);
      setErroSalvar('Não foi possível remover a refeição.');
      setSalvando(false);
    }
  };

  const lidarComEnvioNovoAlimento = async (evento) => {
    evento.preventDefault();
    if (!String(novoAlimento.nome || '').trim()) {
      setErroValidacaoNovoAlimento('O nome do alimento é obrigatório');
      return;
    }

    const erro = validarAlimento(novoAlimento);
    if (erro) {
      setErroValidacaoNovoAlimento(erro);
      return;
    }

    setErroValidacaoNovoAlimento(null);

    if (concluida) {
      setAdicionandoAlimento(true);
      try {
        await aoAdicionarAlimento(refeicao.id, montarAlimento(novoAlimento));
        notificarSucesso(`"${novoAlimento.nome}" adicionado à refeição.`);
        setNovoAlimento(RASCUNHO_VAZIO);
        setMostrarAdicionarAlimento(false);
      } catch (err) {
        // O toast de erro já é disparado globalmente pelo interceptor de
        // resposta do Axios (`services/api.js`), com a mensagem específica
        // vinda do backend (400/404/409/etc.) — nada a duplicar aqui.
        console.error('Erro ao adicionar alimento:', err);
      } finally {
        setAdicionandoAlimento(false);
      }
    } else {
      setAlimentosRascunho((prev) => [
        ...prev,
        { tempId: `${refeicao.id}-${prev.length}-${Date.now()}`, ...montarAlimento(novoAlimento) },
      ]);
      setNovoAlimento(RASCUNHO_VAZIO);
    }
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
      const quantidadeNumerica = extrairQuantidadeNumerica(prev.quantidade);
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
      const macros = calcularMacrosProporcionais(prev.alimentoRef, extrairQuantidadeNumerica(quantidade));
      return {
        ...prev,
        quantidade,
        proteina: String(arredondar1Casa(macros.proteina)),
        carboidratos: String(arredondar1Casa(macros.carboidratos)),
        gordura: String(arredondar1Casa(macros.gordura)),
      };
    });
  };

  const salvarEdicao = async (evento, indice, idAlimento) => {
    evento.preventDefault();
    if (!String(rascunhoEdicao.nome || '').trim()) {
      setErroValidacaoEdicao('O nome do alimento é obrigatório');
      return;
    }

    const erro = validarAlimento(rascunhoEdicao);
    if (erro) {
      setErroValidacaoEdicao(erro);
      return;
    }

    setErroValidacaoEdicao(null);
    await aoEditarAlimento(refeicao.id, idAlimento, montarAlimento(rascunhoEdicao, idAlimento));
    setIndiceEmEdicao(null);
  };

  return (
    <article className={`mb-4 rounded-3xl bg-white shadow-xl shadow-slate-200/50 transition-all dark:bg-zinc-800 dark:shadow-none ${excedeuAlgumaMeta ? 'ring-2 ring-rose-300' : ''}`}>
      <div className="flex w-full min-w-0 items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-5">
        <button type="button" onClick={aoAlternarExpandida} aria-expanded={expandida} className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-90">
          <span className="text-xl" aria-hidden="true">{obterEmojiRefeicao(refeicao.nome)}</span>
          <span className="truncate font-bold text-slate-800 dark:text-zinc-50">{refeicao.nome}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500">{refeicao.horario}</span>
          <span className={`hidden text-[11px] font-bold uppercase tracking-wider sm:inline ${concluida ? 'text-lime-600 dark:text-lime-400' : 'text-amber-500 dark:text-amber-400'}`}>
            {concluida ? 'Concluída' : 'Aguardando'}
          </span>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${concluida ? 'border-lime-400 bg-lime-400 text-zinc-900' : 'border-slate-200 text-transparent dark:border-zinc-600'}`}>
            <Check size={13} strokeWidth={3} />
          </span>
          <button type="button" onClick={() => !expandida && aoAlternarExpandida()} className="flex h-7 w-7 items-center justify-center rounded-xl bg-lime-100 text-lime-700 transition-colors hover:bg-lime-200 dark:bg-lime-400/10 dark:text-lime-300" title="Adicionar alimento" aria-label="Adicionar alimento">
            <Plus size={15} strokeWidth={2.5} />
          </button>
          {aoEditarRefeicao && (
            <button type="button" onClick={() => {
              setRascunhoRefeicao({ nome: refeicao.nome || '', horario: refeicao.horario || '' });
              setEditandoRefeicao(true);
              setConfirmandoExclusaoRefeicao(false);
            }} className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-700" aria-label={`Editar ${refeicao.nome}`}>
              <Pencil size={13} strokeWidth={2.5} />
            </button>
          )}
          {aoRemoverRefeicao && (
            confirmandoExclusaoRefeicao ? (
              <span className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                Remover?
                <button type="button" onClick={removerRefeicao} disabled={salvando} className="hover:underline">Sim</button>
                <button type="button" onClick={() => setConfirmandoExclusaoRefeicao(false)} className="text-slate-400 hover:underline">Não</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmandoExclusaoRefeicao(true)} className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-500 dark:text-zinc-500 dark:hover:bg-rose-500/10" aria-label={`Remover ${refeicao.nome}`}>
                <Trash2 size={13} strokeWidth={2.5} />
              </button>
            )
          )}
        </div>
      </div>

      {editandoRefeicao && (
        <form onSubmit={salvarEdicaoRefeicao} className="mx-5 mb-4 grid gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-900/40 sm:grid-cols-[1fr_auto_auto_auto]">
          <input type="text" value={rascunhoRefeicao.nome} onChange={(e) => setRascunhoRefeicao((p) => ({ ...p, nome: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" aria-label="Nome da refeição" />
          <input type="time" value={rascunhoRefeicao.horario} onChange={(e) => setRascunhoRefeicao((p) => ({ ...p, horario: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" aria-label="Horário da refeição" />
          <button type="submit" disabled={salvando} className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60 dark:bg-lime-400 dark:text-zinc-900">Salvar</button>
          <button type="button" onClick={() => setEditandoRefeicao(false)} className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">Cancelar</button>
        </form>
      )}

      {expandida && (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 pb-5 pt-4 dark:border-zinc-700">
          {aoConcluir && (
            <button type="button" onClick={salvarRefeicao} disabled={salvando || concluida || !podeSalvar} className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${concluida ? 'bg-lime-50 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300' : podeSalvar ? 'bg-lime-400 text-zinc-900 hover:scale-[1.01]' : 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-60 dark:bg-zinc-700/50 dark:text-zinc-500'}`}>
              <Check size={15} strokeWidth={2.5} />
              {concluida ? 'Concluída' : salvando ? 'Salvando...' : 'Salvar refeição'}
            </button>
          )}

          {erroSalvar && <span className="w-fit rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">{erroSalvar}</span>}

          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
            {[
              ['Proteína', totaisDaRefeicao.proteina],
              ['Carbo', totaisDaRefeicao.carboidratos],
              ['Gordura', totaisDaRefeicao.gordura],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="rounded-2xl bg-slate-50 px-3 py-2 text-center dark:bg-zinc-900/40">
                <strong className="block text-sm font-bold text-slate-800 dark:text-zinc-50">{valor.toFixed(1)}g</strong>
                <span className="text-xs text-slate-500 dark:text-zinc-400">{rotulo}</span>
              </div>
            ))}
          </div>

          {jaTemAlimento ? (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {refeicao.alimentos.map((alimento, indice) => (
                <li key={alimento.id ?? `${alimento.nome}-${indice}`}>
                  {indiceEmEdicao === indice ? (
                    <form noValidate onSubmit={(evento) => salvarEdicao(evento, indice, alimento.id)} className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-900/40">
                      <BuscaAlimento valor={rascunhoEdicao.nome} aoDigitar={(nome) => setRascunhoEdicao((p) => ({ ...p, nome, alimentoRef: null }))} aoSelecionar={selecionarAlimentoRef(setRascunhoEdicao)} />
                      <input type="text" inputMode="decimal" placeholder="Quantidade (ex: 200ml)" value={rascunhoEdicao.quantidade} onChange={(e) => { alterarQuantidade(setRascunhoEdicao)(e.target.value); setErroValidacaoEdicao(null); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                        {['proteina', 'carboidratos', 'gordura'].map((campo) => (
                          <input key={campo} type="number" step="0.1" min="0" max={LIMITES_ALIMENTO[campo]} value={rascunhoEdicao[campo]} onChange={(e) => { setRascunhoEdicao((p) => ({ ...p, [campo]: e.target.value })); setErroValidacaoEdicao(null); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-lime-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                        ))}
                      </div>
                      {erroValidacaoEdicao && (
                        <span className="w-fit rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{erroValidacaoEdicao}</span>
                      )}
                      <div className="flex gap-2">
                        <button type="submit" disabled={!!erroValidacaoEdicao} className="flex-1 rounded-lg bg-zinc-900 py-2 text-xs font-bold text-white disabled:opacity-60 dark:bg-lime-400 dark:text-zinc-900">Salvar</button>
                        <button type="button" onClick={() => { setIndiceEmEdicao(null); setErroValidacaoEdicao(null); }} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${PALETA_FUNDO_ICONE[indice % PALETA_FUNDO_ICONE.length]}`}>{obterEmojiAlimento(alimento.nome)}</span>
                        <div>
                          <p className="m-0 text-sm font-semibold text-slate-700 dark:text-zinc-200">{alimento.nome}</p>
                          {alimento.quantidade && <p className="m-0 text-xs text-slate-400 dark:text-zinc-500">{alimento.quantidade}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="mr-1 text-sm font-bold text-slate-500 dark:text-zinc-400">{alimento.calorias > 0 ? `${Math.round(alimento.calorias)} kcal` : '-'}</span>
                        {aoEditarAlimento && <button type="button" onClick={() => iniciarEdicao(indice, alimento)} className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-700"><Pencil size={12} strokeWidth={2.5} /></button>}
                        {aoRemoverAlimento && (
                          confirmandoExclusaoId === alimento.id ? (
                            <span className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                              Remover?
                              <button type="button" onClick={() => { aoRemoverAlimento(refeicao.id, alimento.id); setConfirmandoExclusaoId(null); }} className="hover:underline">Sim</button>
                              <button type="button" onClick={() => setConfirmandoExclusaoId(null)} className="text-slate-400 hover:underline">Não</button>
                            </span>
                          ) : (
                            <button type="button" onClick={() => setConfirmandoExclusaoId(alimento.id)} className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-500 dark:text-zinc-500 dark:hover:bg-rose-500/10"><X size={13} strokeWidth={2.5} /></button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">Nenhum alimento registrado</p>
          )}

          {!concluida && alimentosRascunho.length > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-lime-300 bg-lime-50/40 p-3 dark:border-lime-400/30 dark:bg-lime-400/5">
              <span className="text-xs font-bold text-lime-700 dark:text-lime-300">Prévia: {totaisRascunho.calorias} kcal · P {totaisRascunho.proteina.toFixed(1)}g · C {totaisRascunho.carboidratos.toFixed(1)}g · G {totaisRascunho.gordura.toFixed(1)}g</span>
              {alimentosRascunho.map((alimento) => (
                <div key={alimento.tempId} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 dark:bg-zinc-800">
                  <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{alimento.nome}</span>
                  <button type="button" onClick={() => setAlimentosRascunho((prev) => prev.filter((item) => item.tempId !== alimento.tempId))} className="text-slate-400 hover:text-rose-500"><X size={13} strokeWidth={2.5} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Refeição pendente: formulário sempre visível (fluxo de
              rascunho → "Salvar refeição"). Refeição já concluída: some por
              padrão — só aparece ao clicar em "Adicionar alimento", já que
              aqui cada envio persiste na hora (sem rascunho/Salvar). */}
          {concluida && !mostrarAdicionarAlimento && (
            <button
              type="button"
              onClick={() => setMostrarAdicionarAlimento(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-lime-300 py-2.5 text-sm font-bold text-lime-700 transition-colors hover:bg-lime-50 dark:border-lime-400/30 dark:text-lime-300 dark:hover:bg-lime-400/10"
            >
              <Plus size={14} strokeWidth={2.5} /> Adicionar alimento
            </button>
          )}

          {(!concluida || mostrarAdicionarAlimento) && (
            <form noValidate onSubmit={lidarComEnvioNovoAlimento} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/40">
              <div className="flex items-center justify-between">
                <h4 className="m-0 text-sm font-bold text-slate-600 dark:text-zinc-300">Novo alimento</h4>
                {concluida && (
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarAdicionarAlimento(false);
                      setNovoAlimento(RASCUNHO_VAZIO);
                    }}
                    className="text-slate-400 hover:text-rose-500"
                    aria-label="Cancelar"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <BuscaAlimento valor={novoAlimento.nome} aoDigitar={(nome) => setNovoAlimento((p) => ({ ...p, nome, alimentoRef: null }))} aoSelecionar={selecionarAlimentoRef(setNovoAlimento)} />
              <input type="text" inputMode="decimal" placeholder="Quantidade (ex: 150g ou 200ml)" value={novoAlimento.quantidade} onChange={(e) => { alterarQuantidade(setNovoAlimento)(e.target.value); setErroValidacaoNovoAlimento(null); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-lime-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                {['proteina', 'carboidratos', 'gordura'].map((campo) => (
                  <input key={campo} type="number" step="0.1" min="0" max={LIMITES_ALIMENTO[campo]} placeholder={campo === 'proteina' ? 'Prot' : campo === 'carboidratos' ? 'Carb' : 'Gord'} value={novoAlimento[campo]} onChange={(e) => { setNovoAlimento((p) => ({ ...p, [campo]: e.target.value })); setErroValidacaoNovoAlimento(null); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-lime-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                ))}
              </div>
              {erroValidacaoNovoAlimento && (
                <span className="w-fit rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{erroValidacaoNovoAlimento}</span>
              )}
              <span className="w-fit rounded-full bg-lime-50 px-2.5 py-1 text-xs font-bold text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">Prévia: {Math.round(calcularCaloriasPelosMacros(novoAlimento.proteina, novoAlimento.carboidratos, novoAlimento.gordura))} kcal</span>
              <button type="submit" disabled={adicionandoAlimento || !!erroValidacaoNovoAlimento} className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-bold text-white disabled:opacity-60 dark:bg-lime-400 dark:text-zinc-900"><Plus size={14} strokeWidth={2.5} /> {adicionandoAlimento ? 'Adicionando...' : 'Adicionar'}</button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
