import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
export default function WidgetHidratacao({ dataSelecionadaISO, aoEditarMetas }) {
  const { registros, totalMl, metaMl, loading, erro, adicionarAgua, removerRegistro, definirMetaMl, recarregar } =
    useHidratacao(dataSelecionadaISO);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [adicionandoManual, setAdicionandoManual] = useState(false);
  const [metaEmEdicao, setMetaEmEdicao] = useState(String(metaMl));
  const [quantidadeManual, setQuantidadeManual] = useState('300');
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  const percentualReal = calcularPercentualReal(totalMl, metaMl);
  const progressoVisual = calcularProgressoVisual(percentualReal);
  const offsetAnel = CIRCUNFERENCIA_ANEL - (progressoVisual / 100) * CIRCUNFERENCIA_ANEL;
  const metaDefinida = Number(metaMl) > 0;
  const metaSuperada = metaDefinida && totalMl >= metaMl;

  useEffect(() => {
    setMetaEmEdicao(String(metaMl || ''));
  }, [metaMl]);

  const abrirEdicaoDeMeta = () => {
    if (aoEditarMetas) {
      aoEditarMetas();
      return;
    }
    setMetaEmEdicao(String(metaMl));
    setEditandoMeta(true);
    setAdicionandoManual(false);
  };

  const salvarMeta = async (evento) => {
    evento.preventDefault();
    setErroFormulario('');
    setConfirmacao('');

    try {
      await definirMetaMl(metaEmEdicao);
      setEditandoMeta(false);
      setConfirmacao('Meta de água atualizada com sucesso.');
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
    setConfirmacao('');

    if (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > 5000) {
      setErroFormulario('Informe uma quantidade entre 1 e 5000 ml.');
      return;
    }

    setSalvando(true);
    try {
      await adicionarAgua(quantidade);
      setAdicionandoManual(false);
      setConfirmacao(`${quantidade} mililitros de água registrados com sucesso.`);
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
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-lg font-bold text-content">Consumo de Água</h3>
            <button
              type="button"
              onClick={abrirEdicaoDeMeta}
              className="flex h-6 w-6 items-center justify-center rounded-full text-subtle transition-colors hover:bg-muted hover:text-secondary"
              aria-label="Definir meta de água"
            >
              <Pencil size={13} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
          <p className="m-0 mt-1 text-2xl font-bold text-content">
            {(totalMl / 1000).toFixed(1)}
            <span className="text-base font-semibold text-subtle"> L</span>
            <button
              type="button"
              onClick={abrirAdicaoManual}
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full align-middle text-subtle transition-colors hover:bg-muted hover:text-secondary"
              aria-label="Adicionar água manualmente"
            >
              <Plus size={12} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </p>
          <p className="m-0 text-sm text-subtle">
            {metaDefinida ? `de ${(metaMl / 1000).toFixed(1)} L` : 'Meta de água não definida'}
          </p>
          {metaSuperada && (
            <p className="m-0 mt-1 text-xs font-bold text-brand-soft-ink">Meta atingida ou superada</p>
          )}
        </div>

        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r={RAIO_ANEL} fill="none" stroke="var(--bg-muted)" strokeWidth={ESPESSURA_ANEL} />
            <circle
              cx="32"
              cy="32"
              r={RAIO_ANEL}
              fill="none"
              stroke="var(--brand)"
              strokeWidth={ESPESSURA_ANEL}
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA_ANEL}
              strokeDashoffset={offsetAnel}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-secondary">
            {metaDefinida ? `${Math.round(percentualReal)}%` : '--'}
          </div>
        </div>
      </div>

      {loading && <p role="status" aria-live="polite" className="m-0 text-sm font-semibold text-slate-500 dark:text-zinc-400">Carregando hidratação...</p>}
      {erro && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <span>{erro}</span>
          <button type="button" onClick={recarregar} className="rounded-full bg-white px-3 py-1 text-xs dark:bg-zinc-800">
            Tentar novamente
          </button>
        </div>
      )}

      {editandoMeta ? (
        <form onSubmit={salvarMeta} className="flex items-center gap-2 rounded-2xl bg-muted p-3">
          <label className="flex flex-1 items-center gap-2 text-sm font-semibold text-secondary">
            Meta (ml)
            <input
              id="meta-agua-ml"
              name="metaAguaMl"
              type="number"
              min="250"
              step="250"
              autoFocus
              value={metaEmEdicao}
              onChange={(evento) => setMetaEmEdicao(evento.target.value)}
              aria-describedby={erroFormulario ? 'hidratacao-erro' : undefined}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-content outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
            />
          </label>
          <button
            type="submit"
            aria-label="Salvar meta de água"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink transition-colors hover:opacity-90"
          >
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setEditandoMeta(false)}
            aria-label="Cancelar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-secondary transition-colors hover:bg-line"
          >
            <X size={16} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </form>
      ) : adicionandoManual ? (
        <form onSubmit={salvarConsumoManual} className="flex items-center gap-2 rounded-2xl bg-muted p-3">
          <label className="flex flex-1 items-center gap-2 text-sm font-semibold text-secondary">
            Adicionar (ml)
            <input
              id="consumo-agua-ml"
              name="consumoAguaMl"
              type="number"
              min="1"
              max="5000"
              step="50"
              autoFocus
              value={quantidadeManual}
              onChange={(evento) => setQuantidadeManual(evento.target.value)}
              aria-describedby={erroFormulario ? 'hidratacao-erro' : undefined}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-content outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
            />
          </label>
          <button
            type="submit"
            aria-label="Salvar consumo de água"
            disabled={salvando}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink transition-colors hover:opacity-90"
          >
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setAdicionandoManual(false)}
            aria-label="Cancelar edição de consumo"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-secondary transition-colors hover:bg-line"
          >
            <X size={16} strokeWidth={2.5} aria-hidden="true" />
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
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-2 text-sm font-bold text-brand-soft-ink transition-colors hover:bg-brand/90 hover:text-brand-ink disabled:opacity-60"
            >
              <Droplet size={14} strokeWidth={2.5} aria-hidden="true" />
              {quantidade} ml
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" aria-atomic="true">
        {confirmacao && <p className="m-0 text-xs font-bold text-success">{confirmacao}</p>}
        {erroFormulario && <p id="hidratacao-erro" className="m-0 text-xs font-bold text-rose-700 dark:text-rose-300">{erroFormulario}</p>}
      </div>

      <button
        type="button"
        onClick={abrirAdicaoManual}
        className="inline-flex items-center justify-center gap-1.5 self-start rounded-full bg-brand-soft px-4 py-2 text-sm font-bold text-brand-soft-ink transition-colors hover:bg-brand/90 hover:text-brand-ink"
      >
        <Plus size={14} strokeWidth={2.5} aria-hidden="true" /> Adicionar água
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
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

WidgetHidratacao.propTypes = {
  dataSelecionadaISO: PropTypes.string.isRequired,
  aoEditarMetas: PropTypes.func,
};
