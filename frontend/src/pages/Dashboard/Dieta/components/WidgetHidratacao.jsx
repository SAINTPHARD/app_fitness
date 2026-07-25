import { useState } from 'react';
import { Check, Droplet, Pencil, Plus, X } from 'lucide-react';
import { useHidratacao } from '../hooks/useHidratacao';
import { calcularPercentual } from '../utils/progresso';

const DURACAO_ANIMACAO_MS = 300;
const RAIO_ANEL = 26;
const ESPESSURA_ANEL = 7;
const CIRCUNFERENCIA_ANEL = 2 * Math.PI * RAIO_ANEL;

/**
 * Widget de consumo de água do dia selecionado: anel de progresso + gotas
 * clicáveis (cada uma preenche/esvazia com uma animação curta de "bounce")
 * + um atalho "+250ml" para registrar um copo sem precisar mirar numa gota
 * específica + um botão próprio para definir a meta diária de água (em ml),
 * separado do "Definir meta" geral de calorias/macros. A lógica de negócio
 * (persistência, cálculo de ml) fica inteiramente no hook `useHidratacao`.
 */
export default function WidgetHidratacao({ dataSelecionadaISO }) {
  const { copos, metaCopos, totalMl, metaMl, alternarCopo, adicionarCopo, definirMetaMl } =
    useHidratacao(dataSelecionadaISO);
  const [indiceEmAnimacao, setIndiceEmAnimacao] = useState(null);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaEmEdicao, setMetaEmEdicao] = useState(String(metaMl));

  const percentual = calcularPercentual(totalMl, metaMl);
  const offsetAnel = CIRCUNFERENCIA_ANEL - (percentual / 100) * CIRCUNFERENCIA_ANEL;

  const lidarComCliqueNaGota = (indice) => {
    alternarCopo(indice);
    setIndiceEmAnimacao(indice);
    window.setTimeout(() => setIndiceEmAnimacao(null), DURACAO_ANIMACAO_MS);
  };

  const abrirEdicaoDeMeta = () => {
    setMetaEmEdicao(String(metaMl));
    setEditandoMeta(true);
  };

  const salvarMeta = (evento) => {
    evento.preventDefault();
    definirMetaMl(metaEmEdicao);
    setEditandoMeta(false);
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
          </p>
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">de {(metaMl / 1000).toFixed(1)} L</p>
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
            {Math.round(percentual)}%
          </div>
        </div>
      </div>

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
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: metaCopos }).map((_, indice) => {
            const estaPreenchida = indice < copos;
            const estaAnimando = indiceEmAnimacao === indice;

            return (
              <button
                key={indice}
                type="button"
                onClick={() => lidarComCliqueNaGota(indice)}
                aria-pressed={estaPreenchida}
                aria-label={`${indice + 1}º copo de 250ml`}
                className={[
                  'transition-transform duration-300 ease-out hover:scale-110 active:scale-90',
                  estaAnimando ? 'scale-125' : 'scale-100',
                ].join(' ')}
              >
                <Droplet
                  size={22}
                  strokeWidth={2}
                  className={[
                    'transition-colors duration-300',
                    estaPreenchida ? 'fill-sky-400 text-sky-500' : 'fill-slate-100 text-slate-300 dark:fill-zinc-700 dark:text-zinc-600',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={adicionarCopo}
        className="inline-flex items-center justify-center gap-1.5 self-start rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
      >
        <Plus size={14} strokeWidth={2.5} /> 250ml
      </button>
    </div>
  );
}
