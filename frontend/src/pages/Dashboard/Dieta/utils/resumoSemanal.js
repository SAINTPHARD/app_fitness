import { formatarDataISO } from './calendario';
import { somarMacrosDeAlimentos } from './macros';

// Chave de localStorage usada por `useRefeicoes`. Lida aqui apenas em modo
// LEITURA para agregar VÁRIOS dias de uma vez — `useRefeicoes` foi desenhado
// para filtrar por um único dia selecionado no calendário, não por um
// intervalo, então essa agregação vive à parte, num util puro.
const CHAVE_REFEICOES = 'dieta-refeicoes';

const ROTULOS_DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function lerTodasAsRefeicoesSalvas() {
  if (typeof window === 'undefined') return [];

  try {
    const salvas = window.localStorage.getItem(CHAVE_REFEICOES);
    return salvas ? JSON.parse(salvas) : [];
  } catch {
    return [];
  }
}

/**
 * Monta a série dos últimos `quantidadeDias` (hoje incluso) com o total de
 * calorias consumidas em cada um, a partir dos dados reais já salvos na
 * Dieta. Dias sem nenhuma refeição registrada aparecem com o total zerado —
 * nenhum valor é inventado. Usado tanto pelo gráfico semanal da Home quanto
 * pelo da própria Dieta.
 */
export function obterResumoSemanalDeCalorias(quantidadeDias = 7) {
  const todasRefeicoes = lerTodasAsRefeicoesSalvas();
  const hoje = new Date();

  return Array.from({ length: quantidadeDias }, (_, indice) => {
    const dataDoDia = new Date(hoje);
    dataDoDia.setDate(hoje.getDate() - (quantidadeDias - 1 - indice));
    const iso = formatarDataISO(dataDoDia);

    const refeicoesDesseDia = todasRefeicoes.filter((refeicao) => refeicao.data === iso);
    const totalCalorias = refeicoesDesseDia.reduce(
      (total, refeicao) => total + somarMacrosDeAlimentos(refeicao.alimentos).calorias,
      0
    );

    return { dia: ROTULOS_DIAS_CURTOS[dataDoDia.getDay()], iso, calorias: totalCalorias };
  });
}
