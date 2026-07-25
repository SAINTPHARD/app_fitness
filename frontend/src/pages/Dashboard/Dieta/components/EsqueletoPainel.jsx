/**
 * Skeleton (esqueleto de carregamento) do PainelDieta.
 *
 * Exibido enquanto o hook de "hidratação do cliente" ainda não confirmou que
 * os dados (metas, refeições, hidratação) já foram lidos do localStorage —
 * evita que o layout "pisque" com valores zerados antes de o estado real
 * ser aplicado, e serve de blindagem caso algum dado essencial venha nulo.
 */
export default function EsqueletoPainel() {
  return (
    <section className="flex animate-pulse flex-col gap-8" aria-busy="true" aria-label="Carregando painel de dieta">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-40 rounded-full bg-slate-200 dark:bg-zinc-700" />
        <div className="h-7 w-80 max-w-full rounded-full bg-slate-200 dark:bg-zinc-700" />
        <div className="h-4 w-64 max-w-full rounded-full bg-slate-200 dark:bg-zinc-700" />
      </div>

      <div className="h-20 rounded-3xl bg-slate-200 dark:bg-zinc-700" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-zinc-700 lg:col-span-2" />
        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-zinc-700" />
      </div>

      <div className="h-96 rounded-3xl bg-slate-200 dark:bg-zinc-700" />
    </section>
  );
}
