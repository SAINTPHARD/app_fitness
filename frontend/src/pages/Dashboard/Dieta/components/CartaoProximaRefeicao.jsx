import { Clock, PartyPopper } from 'lucide-react';
import { obterEmojiRefeicao } from '../utils/emojiAlimento';
import './CartaoProximaRefeicao.css';

/**
 * Mostra a próxima refeição planejada para o dia selecionado (dado real,
 * calculado em `obterProximaRefeicao` a partir das refeições já cadastradas
 * logo abaixo) — o usuário vê o que vem a seguir sem precisar abrir o
 * accordion de refeições. Dois estados visuais: "tudo concluído" (empty
 * state premium, quando `refeicao` é `null`) e "pendente" (destaque com
 * selo "Aguardando registro").
 */
export default function CartaoProximaRefeicao({ refeicao }) {
  // ESTADO 1: Tudo concluído — nenhuma refeição pendente hoje.
  if (!refeicao) {
    return (
      <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-xl shadow-slate-200/50 dark:border-emerald-500/20 dark:from-zinc-800 dark:to-emerald-950/30 dark:shadow-none">
        <div className="animate-float-suave flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 shadow-[0_0_20px_rgba(34,197,94,0.2)] dark:bg-emerald-500/10">
          <PartyPopper size={28} strokeWidth={2.5} className="text-emerald-500" />
        </div>
        <div className="mt-3 text-center">
          <h3 className="m-0 text-lg font-bold text-slate-800 dark:text-zinc-50">Tudo Concluído!</h3>
          <p className="m-0 mt-1 text-sm leading-tight text-slate-500 dark:text-zinc-400">
            Você registrou com sucesso todas as refeições planejadas para hoje.
          </p>
        </div>
      </div>
    );
  }

  // ESTADO 2: Refeição pendente.
  return (
    <div className="flex min-h-[140px] flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Próxima Pendente</h3>
        <span className="animate-pulse-lento inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          <Clock size={14} className="text-blue-600 dark:text-blue-300" strokeWidth={2.5} />
          {refeicao.horario}
        </span>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-[0_4px_6px_rgba(15,23,42,0.05)] dark:bg-zinc-800">
          {obterEmojiRefeicao(refeicao.nome)}
        </div>
        <div>
          <p className="m-0 text-lg font-extrabold text-slate-800 dark:text-zinc-50">{refeicao.nome}</p>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
            Aguardando Registro
          </span>
        </div>
      </div>
    </div>
  );
}
