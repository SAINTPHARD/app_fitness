<<<<<<< HEAD
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Beef, Droplet, Droplets, Flame, Plus, Wheat } from 'lucide-react';
=======
import { Droplet, Flame, Plus } from 'lucide-react';
import CartaoMetaDoDia from './components/CartaoMetaDoDia';
>>>>>>> 52d17ad521995726d1cc478a347696f821eb1cce
import CartaoProximoTreino from './components/CartaoProximoTreino';
import CardTimelineDieta from './components/CardTimelineDieta';
import GraficoEvolucaoPeso from './components/GraficoEvolucaoPeso';
import EsqueletoHome from './components/EsqueletoHome';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import { useResumoNutricionalHoje } from './hooks/useResumoNutricionalHoje';

const formatar1Casa = (valor) => (Number(valor) || 0).toFixed(1);
const formatarInteiro = (valor) => String(Math.round(Number(valor) || 0));

// Rótulo em português do objetivo cadastrado no Perfil/Onboarding — usado na
// badge do cartão "Plano de hoje" para a meta calculada refletir o objetivo
// real do usuário, em vez de um texto fixo igual para todo mundo.
const ROTULO_OBJETIVO = {
  EMAGRECER: 'emagrecimento',
  MANTER: 'manutenção',
  HIPERTROFIA: 'hipertrofia',
};

// Paleta de cada macro pedida para o novo layout: ícone e barra de progresso
// na mesma cor, com fundo suave por trás do ícone.
const CORES_MACRO = {
  rose: { icone: 'text-rose-500', fundoIcone: 'bg-rose-50 dark:bg-rose-500/10', barra: 'bg-rose-500' },
  blue: { icone: 'text-blue-500', fundoIcone: 'bg-blue-50 dark:bg-blue-500/10', barra: 'bg-blue-500' },
  teal: { icone: 'text-teal-500', fundoIcone: 'bg-teal-50 dark:bg-teal-500/10', barra: 'bg-teal-500' },
  amber: { icone: 'text-amber-500', fundoIcone: 'bg-amber-50 dark:bg-amber-500/10', barra: 'bg-amber-500' },
  cyan: { icone: 'text-cyan-500', fundoIcone: 'bg-cyan-50 dark:bg-cyan-500/10', barra: 'bg-cyan-500' },
};

export default function HomePage() {
  const [anuncioAgua, setAnuncioAgua] = useState('');
  const [ultimoRegistroAgua, setUltimoRegistroAgua] = useState(null);
  const { carregando, historicoPeso, variacaoPeso, perfil } = usePerfilResumo();
  const resumoHoje = useResumoNutricionalHoje();
  const {
    metas, totaisDoDia, percentuais, agua, refeicoesDoDia,
    adicionarAgua, removerAgua, adicionarRefeicao, removerRefeicao,
  } = resumoHoje;

  if (carregando || resumoHoje.carregando) return <EsqueletoHome />;

  const registrarCopoDeAgua = async () => {
    setAnuncioAgua('');
    try {
      const registro = await adicionarAgua(250);
      setUltimoRegistroAgua(registro);
      setAnuncioAgua('250 mililitros de água registrados com sucesso.');
    } catch {
      setAnuncioAgua('Não foi possível registrar a água agora.');
    }
  };

  const desfazerCopoDeAgua = async () => {
    if (!ultimoRegistroAgua?.id) return;
    try {
      await removerAgua(ultimoRegistroAgua.id);
      setUltimoRegistroAgua(null);
      setAnuncioAgua('Registro de 250 mililitros desfeito.');
    } catch {
      setAnuncioAgua('Não foi possível desfazer o registro de água.');
    }
  };

  const rotuloObjetivo = ROTULO_OBJETIVO[perfil?.objetivo] || null;
  const caloriasConsumidas = Math.round(Number(totaisDoDia.calorias) || 0);
  const metaCalorias = Math.round(Number(metas.calorias) || 0);
  const caloriasRestantes = Math.max(metaCalorias - caloriasConsumidas, 0);
<<<<<<< HEAD

  const blocosMacro = [
    {
      chave: 'calorias', rotulo: 'Calorias', Icone: Flame, cor: 'rose',
      consumido: formatarInteiro(totaisDoDia.calorias), meta: formatarInteiro(metas.calorias), unidade: 'kcal',
      percentual: percentuais.calorias,
      notaExtra: `${formatarInteiro(caloriasRestantes)} kcal restantes`,
    },
    {
      chave: 'proteina', rotulo: 'Proteínas', Icone: Beef, cor: 'blue',
      consumido: formatar1Casa(totaisDoDia.proteina), meta: formatarInteiro(metas.proteinas), unidade: 'g',
      percentual: percentuais.proteina,
    },
    {
      chave: 'carboidratos', rotulo: 'Carboidratos', Icone: Wheat, cor: 'teal',
      consumido: formatar1Casa(totaisDoDia.carboidratos), meta: formatarInteiro(metas.carboidratos), unidade: 'g',
      percentual: percentuais.carboidratos,
    },
    {
      chave: 'gordura', rotulo: 'Gorduras', Icone: Droplet, cor: 'amber',
      consumido: formatar1Casa(totaisDoDia.gordura), meta: formatarInteiro(metas.gorduras), unidade: 'g',
      percentual: percentuais.gordura,
    },
    {
      chave: 'agua', rotulo: 'Água', Icone: Droplets, cor: 'cyan',
      consumido: formatar1Casa(agua.totalMl / 1000), meta: formatar1Casa(agua.metaMl / 1000), unidade: 'L',
      percentual: percentuais.agua,
    },
  ];

  return (
    <section className="flex flex-col gap-6">
      {/* Plano de hoje */}
      <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-lg font-bold text-gray-900 dark:text-zinc-50">Continue no seu plano</h2>
            {rotuloObjetivo && (
              <span className="mt-2 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                Meta calculada para {rotuloObjetivo}
              </span>
            )}
          </div>
          <Link
            to="/dashboard/dieta"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
          >
            Registrar refeição →
          </Link>
        </div>

        {resumoHoje.erro && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {resumoHoje.erro}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {blocosMacro.map(({ chave, rotulo, Icone, cor, consumido, meta, unidade, percentual, notaExtra }) => {
            const cores = CORES_MACRO[cor];
            const progresso = Math.min(Math.max(Number(percentual) || 0, 0), 100);
            return (
              <div key={chave} className="flex flex-col gap-2 rounded-2xl border border-gray-100 p-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cores.fundoIcone}`}>
                    <Icone size={16} className={cores.icone} aria-hidden="true" />
                  </span>
                  <span className="truncate text-xs font-semibold text-gray-500 dark:text-zinc-400">{rotulo}</span>
                </div>

                <p className="m-0 text-sm font-bold text-gray-900 dark:text-zinc-50">
                  {consumido}
                  <span className="font-medium text-gray-400 dark:text-zinc-500"> / {meta} {unidade}</span>
                </p>

                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800"
                  role="progressbar"
                  aria-label={`Progresso de ${rotulo.toLowerCase()}`}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={progresso}
                >
                  <div className={`h-full rounded-full ${cores.barra}`} style={{ width: `${progresso}%` }} />
                </div>

                {notaExtra && <p className="m-0 text-[11px] font-medium text-gray-400 dark:text-zinc-500">{notaExtra}</p>}

                {chave === 'agua' && (
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={registrarCopoDeAgua}
                      className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-bold text-cyan-700 transition-colors hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400"
                    >
                      <Plus size={11} strokeWidth={3} aria-hidden="true" /> 250 ml
                    </button>
                    {ultimoRegistroAgua?.id && (
                      <button
                        type="button"
                        onClick={desfazerCopoDeAgua}
                        className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 dark:text-zinc-500"
                      >
                        Desfazer
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{anuncioAgua}</span>
      </article>

      {/* Refeições (60%) + Treino e Evolução do peso (40%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CardTimelineDieta
            refeicoes={refeicoesDoDia}
            aoAdicionarRefeicao={adicionarRefeicao}
            aoRemoverRefeicao={removerRefeicao}
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <CartaoProximoTreino />
          <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} exibirCtaRegistro />
        </div>
=======
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
>>>>>>> 52d17ad521995726d1cc478a347696f821eb1cce
      </div>
    </section>
  );
}
