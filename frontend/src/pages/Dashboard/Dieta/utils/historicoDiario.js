import { formatarDataISO } from './calendario';
import { somarMacrosDeAlimentos } from './macros';

// Chave usada por `useHidratacao` — lida aqui em modo LEITURA para juntar
// hidratação ao restante da linha de histórico. As refeições NÃO vêm mais
// de localStorage: ver `useHistoricoRefeicoes` (busca real no backend) e o
// comentário lá sobre por que a chave antiga 'dieta-refeicoes' estava
// órfã desde a migração de `useRefeicoes` para a API do Spring Boot.
const CHAVE_HIDRATACAO = 'dieta-hidratacao';

function lerJSON(chave, valorPadrao) {
  if (typeof window === 'undefined') return valorPadrao;

  try {
    const salvo = window.localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : valorPadrao;
  } catch {
    return valorPadrao;
  }
}

function formatarDataParaExibicao(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()}`;
}

/**
 * Monta uma linha de histórico por dia (últimos `quantidadeDias`, hoje
 * incluso), combinando refeições reais do backend (`refeicoesPorDia`, de
 * `useHistoricoRefeicoes`), hidratação e o peso registrado naquele dia (se
 * houver, vindo de `usePerfilResumo`). Dias sem nenhum dado são filtrados
 * fora pelo chamador — aqui só construímos os números reais, sem inventar
 * nada.
 */
export function obterHistoricoDiario(historicoPeso, refeicoesPorDia, quantidadeDias = 7) {
  const hidratacaoPorDia = lerJSON(CHAVE_HIDRATACAO, {});
  const pesoPorDia = new Map(historicoPeso.map((ponto) => [ponto.data, ponto.peso]));

  const hoje = new Date();

  return Array.from({ length: quantidadeDias }, (_, indice) => {
    const dataDoDia = new Date(hoje);
    dataDoDia.setDate(hoje.getDate() - indice);
    const iso = formatarDataISO(dataDoDia);

    const refeicoesDesseDia = refeicoesPorDia?.get(iso) || [];
    const totais = refeicoesDesseDia.reduce(
      (acumulado, refeicao) => {
        const macros = somarMacrosDeAlimentos(refeicao.alimentos);
        return {
          calorias: acumulado.calorias + macros.calorias,
          proteina: acumulado.proteina + macros.proteina,
          carboidratos: acumulado.carboidratos + macros.carboidratos,
          gordura: acumulado.gordura + macros.gordura,
        };
      },
      { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 }
    );

    const copos = hidratacaoPorDia[iso] || 0;

    return {
      iso,
      dataFormatada: formatarDataParaExibicao(dataDoDia),
      // CORREÇÃO (P1.5 — "113.19999999999999" na tabela de Histórico): a
      // soma de vários `alimento.proteina`/`carboidratos`/`gordura` em ponto
      // flutuante quase sempre produz uma dízima binária residual. Cada
      // outro lugar que soma macros (CartaoRefeicao, useRefeicoes) já
      // arredonda o resultado antes de guardar/exibir — esta função era a
      // exceção que vazava o valor cru direto pra tabela.
      calorias: Math.round(totais.calorias),
      proteina: Math.round(totais.proteina * 10) / 10,
      carboidratos: Math.round(totais.carboidratos * 10) / 10,
      gordura: Math.round(totais.gordura * 10) / 10,
      aguaLitros: Number(((copos * 250) / 1000).toFixed(1)),
      peso: pesoPorDia.has(iso) ? pesoPorDia.get(iso) : null,
      temDados: totais.calorias > 0 || copos > 0 || pesoPorDia.has(iso),
    };
  }).filter((linha) => linha.temDados);
}
