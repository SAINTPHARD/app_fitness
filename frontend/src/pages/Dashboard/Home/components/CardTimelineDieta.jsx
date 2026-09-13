import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Check, Circle, Clock, Plus, Salad, X } from 'lucide-react';
import { ordenarPorHorario, refeicaoConcluida } from '../../Dieta/utils/proximaRefeicao';
import { obterIconeRefeicao } from '../../Dieta/utils/iconesAlimento';
import { somarMacrosDeAlimentos } from '../../Dieta/utils/macros';

/** "420 kcal · 32g P · 45g C · 12g G", ou um aviso curto se a refeição
 * ainda não tem nenhum alimento lançado — nunca inventa "0 kcal" como se
 * fosse um valor real registrado. */
function resumirMacrosDaRefeicao(refeicao) {
  if (!refeicao?.alimentos?.length) return 'Sem alimentos registrados';
  const totais = somarMacrosDeAlimentos(refeicao.alimentos);
  const arredondar = (valor) => Math.round(Number(valor) || 0);
  return `${arredondar(totais.calorias)} kcal · ${arredondar(totais.proteina)}g P · ${arredondar(totais.carboidratos)}g C · ${arredondar(totais.gordura)}g G`;
}

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
  const [confirmacao, setConfirmacao] = useState('');

  const lista = ordenarPorHorario(refeicoes);
  const semRefeicoesHoje = lista.length === 0;
  const concluidas = lista.filter(refeicaoConcluida).length;

  const lidarComEnvio = async (evento) => {
    evento.preventDefault();
    if (!novaRefeicao.nome.trim() || !novaRefeicao.horario) return;

    setSalvando(true);
    setErro(null);
    setConfirmacao('');
    try {
      await aoAdicionarRefeicao(novaRefeicao);
      setNovaRefeicao(FORMULARIO_VAZIO);
      setCriando(false);
      setConfirmacao('Refeição adicionada com sucesso.');
    } catch {
      setErro('Não foi possível adicionar a refeição.');
    } finally {
      setSalvando(false);
    }
  };

  const lidarComRemocao = async (idRefeicao) => {
    setRemovendoId(idRefeicao);
    setErro(null);
    setConfirmacao('');
    try {
      await aoRemoverRefeicao(idRefeicao);
    } catch {
      setErro('Não foi possível remover a refeição.');
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <article className="flex min-h-[300px] flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Refeições de hoje</h3>
          <p className="m-0 mt-1 text-xs text-slate-400 dark:text-zinc-500">
            Acompanhe o que já foi registrado e o que ainda falta no dia.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
            {concluidas} de {lista.length} concluídas
          </span>
          <button
            type="button"
            onClick={() => setCriando((prev) => !prev)}
            aria-label="Adicionar refeição"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white transition-transform hover:scale-110 hover:bg-teal-700 active:scale-95"
          >
            <Plus size={15} strokeWidth={3} aria-hidden="true" />
          </button>
        </div>
      </div>

      {criando && (
        <form
          onSubmit={lidarComEnvio}
          className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-900/40"
        >
          <div className="flex gap-2">
            <label htmlFor="home-refeicao-nome" className="sr-only">Nome da refeição</label>
            <input
              id="home-refeicao-nome"
              name="nomeRefeicao"
              type="text"
              placeholder="Nome da refeição"
              value={novaRefeicao.nome}
              onChange={(e) => setNovaRefeicao((prev) => ({ ...prev, nome: e.target.value }))}
              aria-describedby={erro ? 'home-refeicao-erro' : undefined}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              autoFocus
            />
            <label htmlFor="home-refeicao-horario" className="sr-only">Horário da refeição</label>
            <input
              id="home-refeicao-horario"
              name="horarioRefeicao"
              type="time"
              value={novaRefeicao.horario}
              onChange={(e) => setNovaRefeicao((prev) => ({ ...prev, horario: e.target.value }))}
              aria-describedby={erro ? 'home-refeicao-erro' : undefined}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 rounded-xl bg-zinc-900 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 dark:bg-teal-500 dark:text-zinc-900"
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

      <div aria-live="polite" aria-atomic="true">
      {confirmacao && <span className="w-fit text-xs font-bold text-success">{confirmacao}</span>}
      {erro && (
        <span id="home-refeicao-erro" className="w-fit rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {erro}
        </span>
      )}
      </div>

      {semRefeicoesHoje ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Salad size={26} strokeWidth={2} className="text-slate-300 dark:text-zinc-600" aria-hidden="true" />
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-[0_4px_6px_rgba(15,23,42,0.05)] dark:bg-zinc-800">
                  <IconeRefeicao size={19} className="text-teal-600 dark:text-teal-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-bold text-slate-800 dark:text-zinc-50">{refeicao.nome}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                    <Clock size={11} strokeWidth={2.5} aria-hidden="true" />
                    {refeicao.horario}
                  </span>
                  <p className="m-0 mt-0.5 truncate text-xs text-slate-400 dark:text-zinc-500">
                    {resumirMacrosDaRefeicao(refeicao)}
                  </p>
                </div>
                {concluida ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                    Concluído
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                    <Circle size={12} strokeWidth={2} aria-hidden="true" />
                    Pendente
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => lidarComRemocao(refeicao.id)}
                  disabled={removendoId === refeicao.id}
                  aria-label={`Remover ${refeicao.nome}`}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-500 disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                >
                  <X size={13} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        to="/dashboard/dieta"
        className="self-end text-xs font-bold text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        Ver plano completo →
      </Link>
    </article>
  );
}

CardTimelineDieta.propTypes = {
  refeicoes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    nome: PropTypes.string.isRequired,
    horario: PropTypes.string,
  })).isRequired,
  aoAdicionarRefeicao: PropTypes.func.isRequired,
  aoRemoverRefeicao: PropTypes.func.isRequired,
};
