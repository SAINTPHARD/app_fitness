import { useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * Formulário para criar uma nova refeição no dia atualmente selecionado na
 * BarraCalendario (a data em si é atribuída pelo hook `useRefeicoes`, este
 * componente só coleta nome e horário).
 */
export default function FormularioNovaRefeicao({ aoAdicionarRefeicao, aoCancelar }) {
  const [nome, setNome] = useState('');
  const [horario, setHorario] = useState('');

  const lidarComEnvio = (evento) => {
    evento.preventDefault();

    const nomeTratado = nome.trim();
    const horarioTratado = horario.trim();

    if (!nomeTratado || !horarioTratado) return;

    aoAdicionarRefeicao({
      id: Date.now(),
      nome: nomeTratado,
      horario: horarioTratado,
      alimentos: [],
    });

    setNome('');
    setHorario('');
  };

  return (
    <form
      onSubmit={lidarComEnvio}
      className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-zinc-700 dark:bg-zinc-800"
    >
      <h4 className="m-0 text-sm font-bold text-slate-600 dark:text-zinc-300">Nova refeição</h4>
      <input
        type="text"
        placeholder="Nome da refeição"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        required
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
      />
      <input
        type="time"
        placeholder="Horário"
        value={horario}
        onChange={(evento) => setHorario(evento.target.value)}
        required
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] dark:bg-lime-400 dark:text-zinc-900"
        >
          <Plus size={15} strokeWidth={2.5} /> Criar refeição
        </button>
        {aoCancelar && (
          <button
            type="button"
            onClick={aoCancelar}
            className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
