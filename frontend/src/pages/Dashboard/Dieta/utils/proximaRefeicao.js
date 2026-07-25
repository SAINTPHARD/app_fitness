/**
 * Uma refeição é considerada concluída quando já tem pelo menos um
 * alimento registrado — é o único sinal de "consumida" que existe nos
 * dados (não há um campo `concluida` separado).
 */
export function refeicaoConcluida(refeicao) {
  return Boolean(refeicao.alimentos && refeicao.alimentos.length > 0);
}

/**
 * Encontra a próxima refeição pendente do dia: a primeira, em ordem de
 * horário, que ainda não passou E que ainda não tem alimentos registrados.
 * Refeições já concluídas (mesmo as que já passaram do horário) nunca são
 * retornadas — evita o card "Próxima Refeição" continuar mostrando o Café
 * da Manhã já registrado, ou cair de volta nele no fim do dia. Se todas as
 * refeições do dia já estiverem concluídas, retorna `null`. Usado tanto
 * pela Dieta quanto pela Home.
 */
export function obterProximaRefeicao(refeicoes) {
  if (!refeicoes || refeicoes.length === 0) return null;

  const pendentes = refeicoes.filter((refeicao) => !refeicaoConcluida(refeicao));
  if (pendentes.length === 0) return null;

  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const pendentesOrdenadas = [...pendentes].sort((a, b) => a.horario.localeCompare(b.horario));

  const proxima = pendentesOrdenadas.find((refeicao) => {
    const [horas, minutos] = refeicao.horario.split(':').map(Number);
    return horas * 60 + minutos >= minutosAgora;
  });

  return proxima || pendentesOrdenadas[0];
}
