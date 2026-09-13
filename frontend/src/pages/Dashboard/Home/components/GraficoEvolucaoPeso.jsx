import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';

const CHAVE_PREFERENCIAS_LOCAIS = 'perfil-preferencias-locais';

/**
 * `pesoAlvo` (meta de peso) ainda não tem coluna no backend — o Onboarding
 * já salva esse valor só em localStorage (ver `Onboarding/index.jsx`), então
 * lemos daqui pela mesma chave, sem inventar uma nova fonte de dado.
 */
function lerPesoAlvoSalvo() {
  if (typeof window === 'undefined') return null;
  try {
    const salvo = window.localStorage.getItem(CHAVE_PREFERENCIAS_LOCAIS);
    const preferencias = salvo ? JSON.parse(salvo) : null;
    const valor = Number(preferencias?.pesoAlvo);
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  } catch {
    return null;
  }
}

/**
 * Widget "Evolução do peso" da Home: peso atual em destaque, meta ao lado e
 * uma barra ligando os dois — reaproveita o mesmo histórico de peso já
 * carregado por `usePerfilResumo` (usado também pela Dieta/Evolução), sem
 * duplicar nenhuma chamada de API. O gráfico de linha completo continua
 * disponível na página Evolução; aqui o recorte é só o "onde estou vs.
 * onde quero chegar" pedido para este card.
 */
export default function GraficoEvolucaoPeso({ historicoPeso, variacaoPeso, exibirCtaRegistro = false }) {
  const [metaPeso] = useState(lerPesoAlvoSalvo);

  const temPesoRegistrado = historicoPeso.length > 0;
  const pesoAtual = temPesoRegistrado ? historicoPeso[historicoPeso.length - 1].peso : null;
  const pesoInicial = temPesoRegistrado ? historicoPeso[0].peso : null;

  let progresso = null;
  if (pesoAtual != null && pesoInicial != null && metaPeso != null) {
    const distanciaTotal = Math.abs(pesoInicial - metaPeso);
    const distanciaPercorrida = Math.abs(pesoInicial - pesoAtual);
    progresso = distanciaTotal > 0 ? Math.min(100, Math.max(0, Math.round((distanciaPercorrida / distanciaTotal) * 100))) : 100;
  }

  let mensagemIncentivo = 'Continue registrando seu peso para acompanhar sua evolução.';
  if (progresso !== null) {
    if (progresso >= 100) mensagemIncentivo = 'Meta alcançada! Continue mantendo o ritmo.';
    else if (progresso >= 50) mensagemIncentivo = 'Você já percorreu mais da metade do caminho até a meta.';
    else mensagemIncentivo = 'Cada registro te aproxima da sua meta.';
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
      <h3 className="m-0 text-base font-bold text-slate-800 dark:text-zinc-50">Evolução do peso</h3>

      {temPesoRegistrado ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="m-0 text-xs font-semibold text-slate-400 dark:text-zinc-500">Peso atual</p>
              <p className="m-0 text-2xl font-bold text-slate-800 dark:text-zinc-50">
                {pesoAtual} <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500">kg</span>
              </p>
              {variacaoPeso !== null && (
                <p className="m-0 mt-0.5 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  {variacaoPeso <= 0 ? '↓' : '↑'} {Math.abs(variacaoPeso)} kg desde o primeiro registro
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="m-0 text-xs font-semibold text-slate-400 dark:text-zinc-500">Peso meta</p>
              {metaPeso != null ? (
                <p className="m-0 text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {metaPeso} <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500">kg</span>
                </p>
              ) : (
                <Link to="/dashboard/perfil" className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                  Definir meta →
                </Link>
              )}
            </div>
          </div>

          {progresso !== null && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-700">
              <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${progresso}%` }} />
            </div>
          )}

          <p className="m-0 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <Target size={14} strokeWidth={2.5} className="shrink-0 text-teal-500" aria-hidden="true" />
            {mensagemIncentivo}
          </p>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
          <p className="m-0 text-sm text-slate-400 dark:text-zinc-500">
            Registre seu peso para acompanhar a evolução aqui.
          </p>
          {exibirCtaRegistro && (
            <Link to="/dashboard/evolucao" className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
              Registrar peso em Evolução
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

GraficoEvolucaoPeso.propTypes = {
  historicoPeso: PropTypes.arrayOf(PropTypes.shape({ data: PropTypes.string, peso: PropTypes.number })).isRequired,
  variacaoPeso: PropTypes.number,
  exibirCtaRegistro: PropTypes.bool,
};
