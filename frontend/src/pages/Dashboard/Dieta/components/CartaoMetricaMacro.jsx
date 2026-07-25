/**
 * Um dos 4 cartões compactos do topo da Dieta (Calorias, Proteínas,
 * Carboidratos, Gorduras): ícone colorido + valor consumido/meta + barra
 * fina com o percentual ao lado — substitui o antigo card único do "Daily
 * Calorie Intake" por 4 cartões simétricos, mais fáceis de escanear.
 */
export default function CartaoMetricaMacro({ icone: Icone, corIcone, rotulo, consumido, meta, unidade, percentual, alerta }) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${corIcone}`}>
          <Icone size={18} strokeWidth={2.5} />
        </span>
        <p className="m-0 text-sm font-bold text-slate-600 dark:text-zinc-300">{rotulo}</p>
      </div>

      <p className="m-0 text-xl font-bold text-slate-800 dark:text-zinc-50">
        {consumido}
        <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500"> / {meta}{unidade}</span>
      </p>

      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${alerta ? 'bg-rose-400' : 'bg-lime-400'}`}
            style={{ width: `${Math.min(percentual, 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{Math.round(percentual)}%</span>
      </div>
    </article>
  );
}
