import { useEffect, useState } from 'react';
import { Scale, Check } from 'lucide-react';
import { calcularImc } from '../../utils/imc';

/**
 * Widget de atualização rápida de peso.
 * Altura do perfil está em cm (mesmo contrato do backend / Onboarding).
 */
export default function AtualizacaoPesoCard({ perfilAtual, aoAtualizarPerfil }) {
  const [pesoInput, setPesoInput] = useState(perfilAtual?.peso ?? '');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setPesoInput(perfilAtual?.peso ?? '');
  }, [perfilAtual?.peso]);

  const imcAtual = calcularImc(perfilAtual?.peso, perfilAtual?.altura);

  const lidarComAtualizacao = async (e) => {
    e.preventDefault();
    const novoPeso = Number(pesoInput);
    if (!novoPeso || novoPeso <= 0) return;

    setSalvando(true);
    try {
      const imcCalculado = calcularImc(novoPeso, perfilAtual?.altura);

      const perfilAtualizado = {
        ...perfilAtual,
        peso: novoPeso,
        imc: imcCalculado,
      };

      await aoAtualizarPerfil(perfilAtualizado);

      setSucesso(true);
      setTimeout(() => setSucesso(false), 2500);
    } catch (erro) {
      console.error('Erro ao atualizar o peso:', erro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">
          <Scale size={20} strokeWidth={2.5} />
        </span>
        <div>
          <h4 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Registro de peso</h4>
          <p className="m-0 text-xs text-slate-400 dark:text-zinc-400">Atualize sua métrica e acompanhe o IMC</p>
        </div>
      </div>

      <form onSubmit={lidarComAtualizacao} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            step="0.1"
            placeholder="Ex: 75.5"
            value={pesoInput}
            onChange={(e) => setPesoInput(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">kg</span>
        </div>

        <button
          type="submit"
          disabled={salvando}
          className={[
            'flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]',
            sucesso ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white dark:bg-lime-400 dark:text-zinc-900',
          ].join(' ')}
        >
          {sucesso ? <Check size={16} strokeWidth={3} /> : 'Atualizar'}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
        <span>
          IMC atual: <strong>{imcAtual ?? '---'}</strong>
        </span>
        <span>
          Altura: <strong>{perfilAtual?.altura ? `${perfilAtual.altura} cm` : '---'}</strong>
        </span>
      </div>
    </div>
  );
}
