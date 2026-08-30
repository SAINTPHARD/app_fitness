import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Plus, Salad, X } from 'lucide-react';
import { ordenarPorHorario, refeicaoConcluida } from '../../Dieta/utils/proximaRefeicao';
import { obterIconeRefeicao } from '../../Dieta/utils/iconesAlimento';

const FORMULARIO_VAZIO = { nome: '', horario: '' };

/**
 * Card principal de refeições na Home: lista TODAS as refeições do dia
 * (concluídas ou não), sempre com horário visível, e permite adicionar ou
 * remover uma refeição direto por aqui — sem precisar ir até a página de
 * Dieta para isso. A conclusão em si (adicionar alimentos e salvar) continua
 * exclusiva da página de Dieta, que tem o formulário completo.
 */
export default function CardTimelineDieta({ refeicoes, aoAdicionarRefeicao, aoRemoverRefeicao }) {
  const [criando, setCriando] = useState(false);
  const [novaRefeicao, setNovaRefeicao] = useState(FORMULARIO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);
  const [erro, setErro] = useState(null);

  const lista = ordenarPorHorario(refeicoes);
  const semRefeicoesHoje = lista.length === 0;

  const lidarComEnvio = async (evento) => {
    evento.preventDefault();
    if (!novaRefeicao.nome.trim() || !novaRefeicao.horario) return;

    setSalvando(true);
    setErro(null);
    try {
      await aoAdicionarRefeicao(novaRefeicao);
      setNovaRefeicao(FORMULARIO_VAZIO);
      setCriando(false);
    } catch {
      setErro('Não foi possível adicionar a refeição.');
    } finally {
      setSalvando(false);
    }
  };

  const lidarComRemocao = async (idRefeicao) => {
    setRemovendoId(idRefeicao);
    setErro(null);
    try {
      await aoRemoverRefeicao(idRefeicao);
    } catch {
      setErro('Não foi possível remover a refeição.');
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <article className="flex min-h-[300px] flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Refeições do dia</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCriando((prev) => !prev)}
            aria-label="Adicionar refeição"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
          >
            <Plus size={15} strokeWidth={3} />
          </button>
          <Link
            to="/dashboard/dieta"
            className="text-xs font-bold text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Ver plano completo →
          </Link>
        </div>
      </div>

      {criando && (
        <form
          onSubmit={lidarComEnvio}
          className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-900/40"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nome da refeição"
              value={novaRefeicao.nome}
              onChange={(e) => setNovaRefeicao((prev) => ({ ...prev, nome: e.target.value }))}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-emerald-800 dark:focus:ring-emerald-950/40"
              autoFocus
            />
            <input
              type="time"
              value={novaRefeicao.horario}
              onChange={(e) => setNovaRefeicao((prev) => ({ ...prev, horario: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-emerald-800 dark:focus:ring-emerald-950/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 rounded-xl bg-emerald-100 py-2 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-200 disabled:opacity-60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
            >
              {salvando ? 'Adicionando...' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCriando(false);
                setNovaRefeicao(FORMULARIO_VAZIO);
              }}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {erro && (
        <span className="w-fit rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {erro}
        </span>
      )}

      {semRefeicoesHoje ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Salad size={26} strokeWidth={2} className="text-slate-300 dark:text-zinc-600" />
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">Nenhuma refeição cadastrada para hoje ainda.</p>
        </div>
      ) : (
        <ul className="m-0 flex flex-1 list-none flex-col gap-2 overflow-y-auto p-0">
          {lista.map((refeicao) => {
            const concluida = refeicaoConcluida(refeicao);
            const IconeRefeicao = obterIconeRefeicao(refeicao.nome);
            return (
              <li
                key={refeicao.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-lg dark:border-emerald-950 dark:bg-emerald-950/40">
                  <IconeRefeicao size={19} className="text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="m-0 text-sm font-bold text-slate-800 dark:text-zinc-50">{refeicao.nome}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                    <Clock size={11} strokeWidth={2.5} />
                    {refeicao.horario}
                  </span>
                </div>
                <span
                  className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                    concluida
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-slate-200 text-transparent dark:border-zinc-600',
                  ].join(' ')}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <button
                  type="button"
                  onClick={() => lidarComRemocao(refeicao.id)}
                  disabled={removendoId === refeicao.id}
                  aria-label={`Remover ${refeicao.nome}`}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-500 disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
