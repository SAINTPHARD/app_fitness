import { formatarDataISO } from './calendario';
import { somarMacrosDeAlimentos } from './macros';

// Mesmas chaves usadas por `useRefeicoes` e `useHidratacao` — lidas aqui em
// modo LEITURA para juntar os três "bancos" que já existem (refeições,
// hidratação e o histórico de peso de `usePerfilResumo`) numa única linha
// por dia, para a tabela de Histórico.
const CHAVE_REFEICOES = 'dieta-refeicoes';
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
 * incluso), combinando refeições (calorias/macros), hidratação e o peso
 * registrado naquele dia (se houver, vindo de `usePerfilResumo`). Dias sem
 * nenhum dado são filtrados fora pelo chamador — aqui só construímos os
 * números reais, sem inventar nada.
 */
export function obterHistoricoDiario(historicoPeso, quantidadeDias = 7) {
  const todasRefeicoes = lerJSON(CHAVE_REFEICOES, []);
  const hidratacaoPorDia = lerJSON(CHAVE_HIDRATACAO, {});
  const pesoPorDia = new Map(historicoPeso.map((ponto) => [ponto.data, ponto.peso]));

  const hoje = new Date();

  return Array.from({ length: quantidadeDias }, (_, indice) => {
    const dataDoDia = new Date(hoje);
    dataDoDia.setDate(hoje.getDate() - indice);
    const iso = formatarDataISO(dataDoDia);

    const refeicoesDesseDia = todasRefeicoes.filter((refeicao) => refeicao.data === iso);
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
      calorias: totais.calorias,
      proteina: totais.proteina,
      carboidratos: totais.carboidratos,
      gordura: totais.gordura,
      aguaLitros: Number(((copos * 250) / 1000).toFixed(1)),
      peso: pesoPorDia.has(iso) ? pesoPorDia.get(iso) : null,
      temDados: totais.calorias > 0 || copos > 0 || pesoPorDia.has(iso),
    };
  }).filter((linha) => linha.temDados);
}
