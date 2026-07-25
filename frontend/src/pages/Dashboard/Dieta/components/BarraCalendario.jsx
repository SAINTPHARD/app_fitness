import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatarDataISO, obterDataDeHojeISO, obterDiasDaSemana } from '../utils/calendario';

/**
 * Barra de navegação semanal (Dom a Sáb) exibida no topo do painel de dieta.
 * Permite trocar o dia selecionado — refeições e hidratação exibidos abaixo
 * passam a refletir o dia escolhido aqui — e também navegar para a semana
 * anterior/seguinte sem precisar trocar o dia selecionado primeiro.
 */
export default function BarraCalendario({ dataSelecionadaISO, aoSelecionarDia }) {
  const diasDaSemana = obterDiasDaSemana(dataSelecionadaISO);
  const hojeISO = obterDataDeHojeISO();

  // Navegar de semana não muda o dia selecionado, só o "recorte" de 7 dias
  // exibido — por isso desloca a data de referência em ±7 dias mantendo o
  // dia da semana correspondente como novo selecionado.
  const irParaSemana = (deslocamentoDias) => {
    const [ano, mes, dia] = dataSelecionadaISO.split('-').map(Number);
    const novaData = new Date(ano, mes - 1, dia);
    novaData.setDate(novaData.getDate() + deslocamentoDias);
    aoSelecionarDia(formatarDataISO(novaData));
  };

  return (
    <div
      className="flex items-center gap-2 rounded-3xl bg-white p-3 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none"
      role="tablist"
      aria-label="Selecionar dia da semana"
    >
      <button
        type="button"
        onClick={() => irParaSemana(-7)}
        aria-label="Semana anterior"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:text-zinc-500 dark:hover:bg-zinc-700"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      <div className="flex flex-1 items-center justify-between gap-1 overflow-x-auto sm:gap-2">
        {diasDaSemana.map((dia) => {
          const estaSelecionado = dia.iso === dataSelecionadaISO;
          const ehHoje = dia.iso === hojeISO;

          return (
            <button
              key={dia.iso}
              type="button"
              role="tab"
              aria-selected={estaSelecionado}
              onClick={() => aoSelecionarDia(dia.iso)}
              className={[
                // Destaque forte (verde-lima néon) no dia ativo; os demais ficam
                // discretos até o hover, mantendo a hierarquia visual clara.
                'flex min-w-[52px] flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-3 transition-all',
                estaSelecionado
                  ? 'bg-lime-400 text-zinc-900 shadow-lg shadow-lime-200'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-700',
              ].join(' ')}
            >
              <span className="text-xs font-bold uppercase tracking-wide">{dia.rotulo}</span>
              <span className="text-lg font-bold">{dia.numero}</span>
              {ehHoje && !estaSelecionado && <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => irParaSemana(7)}
        aria-label="Próxima semana"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:text-zinc-500 dark:hover:bg-zinc-700"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
