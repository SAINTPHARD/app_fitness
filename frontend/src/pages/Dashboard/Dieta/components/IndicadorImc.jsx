import { calcularPosicaoNaFaixa } from '../../../../utils/imc';

/**
 * IMC com uma barra gradiente (abaixo do peso → normal → sobrepeso →
 * obesidade) e um ponteiro indicando onde o valor atual cai na faixa —
 * mais informativo que só mostrar o número e a classificação em texto.
 */
export default function IndicadorImc({ imc, classificacao }) {
  const posicao = calcularPosicaoNaFaixa(imc);

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">IMC</h3>

      <div>
        <p className="m-0 text-2xl font-bold text-slate-800 dark:text-zinc-50">{imc ?? '---'}</p>
        {classificacao && <p className="m-0 text-sm font-semibold text-slate-500 dark:text-zinc-400">{classificacao}</p>}
      </div>

      {imc !== null && (
        <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-sky-400 via-lime-400 to-rose-400">
          <div
            className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded-full bg-slate-700 dark:bg-zinc-100"
            style={{ left: `${posicao}%` }}
          />
        </div>
      )}
    </div>
  );
}
