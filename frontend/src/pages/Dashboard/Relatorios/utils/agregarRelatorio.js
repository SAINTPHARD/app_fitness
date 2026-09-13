const formatadorNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function formatarNumeroRelatorio(valor) {
  return formatadorNumero.format(Number(valor) || 0);
}

export function calcularComparacao(atual, anterior) {
  if (!Number.isFinite(Number(atual)) || !Number.isFinite(Number(anterior)) || Number(anterior) === 0) return null;
  return Number((((Number(atual) - Number(anterior)) / Math.abs(Number(anterior))) * 100).toFixed(1));
}

export function montarCsvRelatorio(relatorio) {
  const cabecalho = 'data;calorias_kcal;agua_ml;peso_kg;sessoes;sessoes_concluidas';
  const linhas = (relatorio?.serie || []).map((item) => [
    new Intl.DateTimeFormat('pt-BR').format(new Date(`${item.data}T12:00:00`)), item.calorias,
    item.aguaMl, item.peso == null ? '' : formatarNumeroRelatorio(item.peso), item.sessoes, item.sessoesConcluidas,
  ].join(';'));
  return `\uFEFF${[cabecalho, ...linhas].join('\n')}`;
}

export function baixarCsv(conteudo, nomeArquivo) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = nomeArquivo; link.click(); URL.revokeObjectURL(url);
}
