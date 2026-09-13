/**
 * Esqueleto de carregamento da Home, exibido enquanto os dados do dia
 * (perfil, refeições, hidratação) ainda não terminaram de chegar do
 * backend — evita que a página "pisque" com cartões vazios/zerados antes
 * dos dados reais chegarem. Formato alinhado ao layout real (cartão cheio
 * no topo + grade 60/40 embaixo) para não haver salto visual ao carregar.
 */
export default function EsqueletoHome() {
  return (
    <section
      className="flex animate-pulse flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando painel inicial"
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
        <div className="h-5 w-48 rounded-full bg-gray-100 dark:bg-zinc-700" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, indice) => (
            <div key={indice} className="h-28 rounded-2xl bg-gray-100 dark:bg-zinc-700" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="h-80 rounded-2xl bg-gray-100 dark:bg-zinc-800 lg:col-span-3" />
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="h-36 rounded-2xl bg-gray-100 dark:bg-zinc-800" />
          <div className="h-36 rounded-2xl bg-gray-100 dark:bg-zinc-800" />
        </div>
      </div>
    </section>
  );
}
