import { Droplet, Flame, Plus } from 'lucide-react';
import CartaoMetaDoDia from './components/CartaoMetaDoDia';
import CartaoProximoTreino from './components/CartaoProximoTreino';
import CardTimelineDieta from './components/CardTimelineDieta';
import GraficoSemanal from './components/GraficoSemanal';
import GraficoEvolucaoPeso from './components/GraficoEvolucaoPeso';
import EsqueletoHome from './components/EsqueletoHome';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import { useResumoNutricionalHoje } from './hooks/useResumoNutricionalHoje';

const formatar1Casa = (valor) => (Number(valor) || 0).toFixed(1);
const formatarCalorias = (valor) => String(Math.round(Number(valor) || 0));

export default function HomePage() {
  const { carregando, historicoPeso, variacaoPeso, registrarPeso } = usePerfilResumo();
  const { metas, totaisDoDia, percentuais, metaDoDiaPercentual, agua, refeicoesDoDia, adicionarAgua, adicionarRefeicao, removerRefeicao } = useResumoNutricionalHoje();

  if (carregando) return <EsqueletoHome />;

  const caloriasConsumidas = Math.round(Number(totaisDoDia.calorias) || 0);
  const metaCalorias = Math.round(Number(metas.calorias) || 0);
  const caloriasRestantes = Math.max(metaCalorias - caloriasConsumidas, 0);
  const quantidadeRefeicoes = refeicoesDoDia.length;
  const progressoCalorias = Math.min(Math.max(percentuais.calorias, 0), 100);
  const macros = [
    { rotulo: 'Proteína', consumido: totaisDoDia.proteina, meta: metas.proteinas },
    { rotulo: 'Carboidrato', consumido: totaisDoDia.carboidratos, meta: metas.carboidratos },
    { rotulo: 'Gordura', consumido: totaisDoDia.gordura, meta: metas.gorduras },
  ];

  return (
    <section className="flex min-h-full flex-col gap-7 bg-[var(--bg-primary)] motion-safe:animate-fade-in">
      <header>
        <h1 className="m-0 text-lg font-semibold leading-relaxed text-slate-600 dark:text-zinc-300 sm:text-xl">
          Restam hoje <strong>{formatarCalorias(caloriasRestantes)} kcal</strong> de {formatarCalorias(metaCalorias)}
          <span aria-hidden="true"> · </span>
          <span className="text-slate-500 dark:text-zinc-400">{quantidadeRefeicoes} {quantidadeRefeicoes === 1 ? 'refeição registrada' : 'refeições registradas'}</span>
        </h1>
      </header>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(230px,0.8fr)]">
        <article className="flex min-h-[220px] flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 lg:row-span-2 lg:min-h-[250px]">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-500 dark:text-zinc-400">
            <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Flame size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <span>Calorias consumidas</span>
          </div>
          <p className="my-5 text-5xl font-bold leading-none tracking-tight text-slate-700 dark:text-zinc-100 sm:text-6xl">
            {formatarCalorias(caloriasConsumidas)}
            <span className="ml-2 text-base font-medium tracking-normal text-slate-500 dark:text-zinc-400">/ {formatarCalorias(metaCalorias)} kcal</span>
          </p>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800" role="progressbar" aria-label="Progresso de calorias" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressoCalorias}>
            <div className={`h-full rounded-full transition-[width] duration-300 ${percentuais.calorias >= 100 ? 'bg-red-600 dark:bg-red-500' : 'bg-[var(--brand)]'}`} style={{ width: `${Math.min(progressoCalorias, 100)}%` }} />
          </div>
        </article>

        <div className="grid grid-cols-3 rounded-2xl border border-slate-200 bg-white px-3 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5">
          {macros.map(({ rotulo, consumido, meta }, indice) => (
            <div className={`min-w-0 px-2 text-center sm:px-4 ${indice > 0 ? 'border-l border-slate-200 dark:border-zinc-800' : ''}`} key={rotulo}>
              <strong className="block truncate text-lg font-semibold text-slate-800 dark:text-zinc-100">{formatar1Casa(consumido)}g</strong>
              <span className="block truncate text-xs font-medium text-slate-500 dark:text-zinc-400">{rotulo}</span>
              <small className="mt-1 block truncate text-xs text-slate-400 dark:text-zinc-500">meta {meta || 0}g</small>
            </div>
          ))}
        </div>

        <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"><Droplet size={19} aria-hidden="true" /></span>
            <div className="flex flex-col text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span>Água</span>
              <strong className="text-base text-slate-800 dark:text-zinc-100">{(agua.totalMl / 1000).toFixed(1)} L <small className="font-medium text-slate-500 dark:text-zinc-400">de {(agua.metaMl / 1000).toFixed(1)} L</small></strong>
            </div>
          </div>
          <button type="button" onClick={() => adicionarAgua(250)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-bold text-[var(--brand-ink)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 dark:ring-offset-zinc-900"><Plus size={15} strokeWidth={2.5} aria-hidden="true" /> 250 ml</button>
        </article>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        <CartaoProximoTreino />
        <CardTimelineDieta refeicoes={refeicoesDoDia} aoAdicionarRefeicao={adicionarRefeicao} aoRemoverRefeicao={removerRefeicao} />
        <CartaoMetaDoDia percentual={metaDoDiaPercentual} />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        <GraficoSemanal />
        <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} aoRegistrarPeso={registrarPeso} />
      </div>
    </section>
  );
}
