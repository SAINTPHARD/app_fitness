import { formatarDataISO } from '../../Dieta/utils/calendario';
import { somarMacrosDeAlimentos } from '../../Dieta/utils/macros';

// 'dieta-refeicoes' foi removida daqui: era uma chave de localStorage órfã
// (ver `useHistoricoRefeicoes` para o histórico completo dessa correção) —
// as refeições agora chegam como parâmetro `refeicoesPorDia`, já buscadas
// de verdade no backend. Água, peso e treino continuam em localStorage
// porque `useHidratacao`/`usePerfilResumo`/`useFichasTreino` realmente
// escrevem nessas chaves.
const CHAVE_HIDRATACAO = 'dieta-hidratacao';
const CHAVE_HISTORICO_PESO = 'home-historico-peso';
const CHAVE_TREINO = 'treino-fichas-por-dia';

function lerJSON(chave, padrao) {
  if (typeof window === 'undefined') return padrao;
  try {
    const salvo = window.localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : padrao;
  } catch {
    return padrao;
  }
}

function formatarDataCurta(iso) {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

/**
 * Agrega dieta (real, vinda do backend via `refeicoesPorDia`), água, peso e
 * treinos concluídos nos últimos `dias` dias.
 */
export function obterDadosRelatorio(refeicoesPorDia, dias = 30) {
  const hidratacao = lerJSON(CHAVE_HIDRATACAO, {});
  const historicoPeso = lerJSON(CHAVE_HISTORICO_PESO, []);
  const fichas = lerJSON(CHAVE_TREINO, {});

  const pesosPorDia = new Map(historicoPeso.map((p) => [p.data, p.peso]));
  const exerciciosConcluidos = Object.values(fichas)
    .flat()
    .filter((ex) => ex?.concluido).length;
  const totalExercicios = Object.values(fichas).flat().length;

  const hoje = new Date();
  const serie = [];

  for (let i = dias - 1; i >= 0; i -= 1) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);
    const iso = formatarDataISO(data);

    const refeicoesDoDia = refeicoesPorDia?.get(iso) || [];
    const macros = refeicoesDoDia.reduce(
      (acc, refeicao) => {
        const m = somarMacrosDeAlimentos(refeicao.alimentos || []);
        return {
          calorias: acc.calorias + m.calorias,
          proteina: acc.proteina + m.proteina,
        };
      },
      { calorias: 0, proteina: 0 }
    );

    const copos = hidratacao[iso] || 0;
    const aguaMl = copos * 250;

    serie.push({
      iso,
      rotulo: formatarDataCurta(iso),
      calorias: Math.round(macros.calorias),
      proteina: Number(macros.proteina.toFixed(1)),
      aguaMl,
      peso: pesosPorDia.has(iso) ? pesosPorDia.get(iso) : null,
    });
  }

  const diasComCalorias = serie.filter((d) => d.calorias > 0);
  const diasComAgua = serie.filter((d) => d.aguaMl > 0);
  const pontosPeso = serie.filter((d) => d.peso != null).map((d) => d.peso);

  const kcalMedia =
    diasComCalorias.length > 0
      ? Math.round(diasComCalorias.reduce((s, d) => s + d.calorias, 0) / diasComCalorias.length)
      : 0;

  const aguaMediaMl =
    diasComAgua.length > 0
      ? Math.round(diasComAgua.reduce((s, d) => s + d.aguaMl, 0) / diasComAgua.length)
      : 0;

  const variacaoPeso =
    pontosPeso.length >= 2 ? Number((pontosPeso[pontosPeso.length - 1] - pontosPeso[0]).toFixed(1)) : null;

  return {
    serie,
    resumo: {
      kcalMedia,
      aguaMediaMl,
      variacaoPeso,
      treinosConcluidos: exerciciosConcluidos,
      treinosTotal: totalExercicios,
      diasComRegistro: serie.filter((d) => d.calorias > 0 || d.aguaMl > 0 || d.peso != null).length,
    },
  };
}

export function montarCsvRelatorio(serie) {
  const cabecalho = 'data,calorias,proteina_g,agua_ml,peso_kg';
  const linhas = serie.map((d) =>
    [d.iso, d.calorias, d.proteina, d.aguaMl, d.peso ?? ''].join(',')
  );
  return [cabecalho, ...linhas].join('\n');
}

export function baixarCsv(conteudo, nomeArquivo) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
