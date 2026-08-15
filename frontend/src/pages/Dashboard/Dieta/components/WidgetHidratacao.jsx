import { useEffect, useState } from 'react';
import { Check, Droplet, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useHidratacao } from '../hooks/useHidratacao';
import { calcularPercentualReal, calcularProgressoVisual } from '../utils/progresso';

const RAIO_ANEL = 26;
const ESPESSURA_ANEL = 7;
const CIRCUNFERENCIA_ANEL = 2 * Math.PI * RAIO_ANEL;
const OPCOES_RAPIDAS_ML = [200, 300, 500];

/**
 * Widget de consumo de água do dia selecionado: anel de progresso + gotas
 * clicáveis (cada uma preenche/esvazia com uma animação curta de "bounce")
 * + um atalho "+250ml" para registrar um copo sem precisar mirar numa gota
 * específica + um botão próprio para definir a meta diária de água (em ml),
 * separado do "Definir meta" geral de calorias/macros. A lógica de negócio
 * (persistência, cálculo de ml) fica inteiramente no hook `useHidratacao`.
 */
export default function WidgetHidratacao({ dataSelecionadaISO }) {
  const { registros, totalMl, metaMl, loading, erro, adicionarAgua, removerRegistro, definirMetaMl, recarregar } =
    useHidratacao(dataSelecionadaISO);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [adicionandoManual, setAdicionandoManual] = useState(false);
  const [metaEmEdicao, setMetaEmEdicao] = useState(String(metaMl));
  const [quantidadeManual, setQuantidadeManual] = useState('300');
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');

  const percentualReal = calcularPercentualReal(totalMl, metaMl);
  const progressoVisual = calcularProgressoVisual(percentualReal);
  const offsetAnel = CIRCUNFERENCIA_ANEL - (progressoVisual / 100) * CIRCUNFERENCIA_ANEL;
  const metaDefinida = Number(metaMl) > 0;
  const metaSuperada = metaDefinida && totalMl >= metaMl;

  useEffect(() => {
    setMetaEmEdicao(String(metaMl || ''));
  }, [metaMl]);

  const abrirEdicaoDeMeta = () => {
    setMetaEmEdicao(String(metaMl));
    setEditandoMeta(true);
    setAdicionandoManual(false);
  };

  const salvarMeta = async (evento) => {
    evento.preventDefault();
    setErroFormulario('');

    try {
      await definirMetaMl(metaEmEdicao);
      setEditandoMeta(false);
    } catch {
      setErroFormulario('Não foi possível salvar a meta de água.');
    }
  };

  const abrirAdicaoManual = () => {
    setQuantidadeManual('300');
    setAdicionandoManual(true);
    setEditandoMeta(false);
  };

  const registrarAgua = async (quantidadeMl) => {
    const quantidade = Number(quantidadeMl);
    setErroFormulario('');

    if (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > 5000) {
      setErroFormulario('Informe uma quantidade entre 1 e 5000 ml.');
      return;
    }

    setSalvando(true);
    try {
      await adicionarAgua(quantidade);
      setAdicionandoManual(false);
    } catch {
      setErroFormulario('Não foi possível registrar a água agora.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarConsumoManual = (evento) => {
    evento.preventDefault();
    registrarAgua(quantidadeManual);
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-lg font-bold text-slate-800 dark:text-zinc-50">Consumo de Água</h3>
            <button
              type="button"
              onClick={abrirEdicaoDeMeta}
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              aria-label="Definir meta de água"
            >
              <Pencil size={13} strokeWidth={2.5} />
            </button>
          </div>
          <p className="m-0 mt-1 text-2xl font-bold text-slate-800 dark:text-zinc-50">
            {(totalMl / 1000).toFixed(1)}
            <span className="text-base font-semibold text-slate-400 dark:text-zinc-500"> L</span>
            <button
              type="button"
              onClick={abrirAdicaoManual}
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full align-middle text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              aria-label="Adicionar água manualmente"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </p>
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">
            {metaDefinida ? `de ${(metaMl / 1000).toFixed(1)} L` : 'Meta de água não definida'}
          </p>
          {metaSuperada && (
            <p className="m-0 mt-1 text-xs font-bold text-sky-600 dark:text-sky-300">Meta atingida ou superada</p>
          )}
        </div>

        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
            <circle cx="32" cy="32" r={RAIO_ANEL} fill="none" stroke="#f1f5f9" strokeWidth={ESPESSURA_ANEL} className="dark:stroke-zinc-700" />
            <circle
              cx="32"
              cy="32"
              r={RAIO_ANEL}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={ESPESSURA_ANEL}
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA_ANEL}
              strokeDashoffset={offsetAnel}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-zinc-200">
            {metaDefinida ? `${Math.round(percentualReal)}%` : '--'}
          </div>
        </div>
      </div>

      {loading && <p className="m-0 text-sm font-semibold text-slate-400 dark:text-zinc-500">Carregando hidratação...</p>}
      {erro && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <span>{erro}</span>
          <button type="button" onClick={recarregar} className="rounded-full bg-white px-3 py-1 text-xs dark:bg-zinc-800">
            Tentar novamente
          </button>
        </div>
      )}

      {editandoMeta ? (
        <form onSubmit={salvarMeta} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-900/40">
          <label className="flex flex-1 items-center gap-2 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            Meta (ml)
            <input
              type="number"
              min="250"
              step="250"
              autoFocus
              value={metaEmEdicao}
              onChange={(evento) => setMetaEmEdicao(evento.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button
            type="submit"
            aria-label="Salvar meta de água"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-600"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => setEditandoMeta(false)}
            aria-label="Cancelar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 dark:bg-zinc-700 dark:text-zinc-300"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </form>
      ) : adicionandoManual ? (
        <form onSubmit={salvarConsumoManual} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-900/40">
          <label className="flex flex-1 items-center gap-2 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            Adicionar (ml)
            <input
              type="number"
              min="1"
              max="5000"
              step="50"
              autoFocus
              value={quantidadeManual}
              onChange={(evento) => setQuantidadeManual(evento.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button
            type="submit"
            aria-label="Salvar consumo de água"
            disabled={salvando}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-600"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => setAdicionandoManual(false)}
            aria-label="Cancelar edição de consumo"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 dark:bg-zinc-700 dark:text-zinc-300"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {OPCOES_RAPIDAS_ML.map((quantidade) => (
            <button
              key={quantidade}
              type="button"
              disabled={salvando}
              onClick={() => registrarAgua(quantidade)}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-2 text-sm font-bold text-sky-600 transition-colors hover:bg-sky-100 disabled:opacity-60 dark:bg-sky-500/10 dark:text-sky-300"
            >
              <Droplet size={14} strokeWidth={2.5} />
              {quantidade} ml
            </button>
          ))}
        </div>
      )}

      {erroFormulario && <p className="m-0 text-xs font-bold text-rose-500">{erroFormulario}</p>}

      <button
        type="button"
        onClick={abrirAdicaoManual}
        className="inline-flex items-center justify-center gap-1.5 self-start rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
      >
        <Plus size={14} strokeWidth={2.5} /> Adicionar água
      </button>

      {registros.length > 0 && (
        <div className="border-t border-slate-100 pt-3 dark:border-zinc-700">
          <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">Histórico do dia</p>
          <ul className="m-0 grid list-none gap-1 p-0">
            {[...registros].reverse().slice(0, 3).map((registro) => (
              <li key={registro.id} className="flex items-center justify-between gap-2 text-sm text-slate-500 dark:text-zinc-400">
                <span>{registro.quantidadeMl} ml</span>
                <button
                  type="button"
                  onClick={() => removerRegistro(registro.id)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-600 dark:hover:bg-rose-500/10"
                  aria-label="Remover lançamento de água"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
