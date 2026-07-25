import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, PartyPopper } from 'lucide-react';
import { refeicaoConcluida } from '../../Dieta/utils/proximaRefeicao';
import { obterEmojiRefeicao } from '../../Dieta/utils/emojiAlimento';

/**
 * Centro de comando da dieta diária na Home — substitui o antigo
 * `CartaoProximaRefeicao` (que só mostrava a próxima refeição isolada) por
 * uma visão de linha do tempo: o que já foi concluído, o que é a próxima
 * ação pendente e quantas refeições ainda restam depois dela.
 *
 * Usa Tailwind (como o módulo Dieta, de onde vêm os dados) em vez de CSS
 * Modules (padrão do resto da Home) — decisão explícita para este cartão.
 */
export default function CardTimelineDieta({ refeicoes }) {
  const { concluidas, proxima, futuras } = useMemo(() => {
    const lista = [...(refeicoes || [])].sort((a, b) => a.horario.localeCompare(b.horario));

    const concluidasOrdenadas = lista.filter(refeicaoConcluida);
    const pendentesOrdenadas = lista.filter((refeicao) => !refeicaoConcluida(refeicao));

    const [primeiraPendente, ...restantesPendentes] = pendentesOrdenadas;

    return {
      concluidas: concluidasOrdenadas,
      proxima: primeiraPendente || null,
      futuras: restantesPendentes,
    };
  }, [refeicoes]);

  const semRefeicoesHoje = !refeicoes || refeicoes.length === 0;

  return (
    <article className="flex min-h-[300px] flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Timeline da Dieta</h3>
        <Link
          to="/dashboard/dieta"
          className="text-xs font-bold text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Ver plano completo →
        </Link>
      </div>

      {/* Bloco 1 — histórico: só aparece quando já existe pelo menos 1 refeição concluída. */}
      {concluidas.length > 0 && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="m-0 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
            <strong>
              {concluidas.length} {concluidas.length === 1 ? 'refeição concluída' : 'refeições concluídas'} hoje:
            </strong>{' '}
            {concluidas.map((refeicao) => refeicao.nome).join(', ')}
          </p>
        </div>
      )}

      {/* Bloco 2 — destaque central: próxima refeição pendente, ou celebração se não houver nenhuma. */}
      {proxima ? (
        <div className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
          <span className="animate-pulse absolute inset-y-0 left-0 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />

          <div className="ml-2 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-[0_4px_6px_rgba(15,23,42,0.05)] dark:bg-zinc-800">
            {obterEmojiRefeicao(proxima.nome)}
          </div>

          <div className="flex flex-col gap-1">
            <span className="w-fit text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Próxima refeição
            </span>
            <p className="m-0 text-lg font-extrabold text-slate-800 dark:text-zinc-50">{proxima.nome}</p>
            <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-slate-400 dark:text-zinc-500">
              <Clock size={12} strokeWidth={2.5} />
              {proxima.horario}
            </span>
          </div>
        </div>
      ) : semRefeicoesHoje ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 p-4 text-center dark:border-zinc-700">
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">Nenhuma refeição cadastrada para hoje ainda.</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-4 text-center dark:border-emerald-500/20 dark:from-zinc-800 dark:to-emerald-950/30">
          <div className="animate-bounce flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
            <PartyPopper size={22} strokeWidth={2.5} className="text-emerald-500" />
          </div>
          <p className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Metas Atingidas!</p>
          <p className="m-0 text-xs text-slate-500 dark:text-zinc-400">
            Você já registrou todas as refeições planejadas para hoje.
          </p>
        </div>
      )}

      {/* Bloco 3 — rodapé: quantas refeições ainda restam depois da próxima. */}
      {futuras.length > 0 && (
        <p className="m-0 text-center text-xs font-medium text-slate-400 dark:text-zinc-500">
          + {futuras.length} {futuras.length === 1 ? 'refeição planejada' : 'refeições planejadas'} depois desta
        </p>
      )}
    </article>
  );
}
