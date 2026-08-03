/**
 * Uma refeição é considerada concluída quando `status === 'CONCLUIDO'` —
 * campo persistido no backend (ver `Refeicao.status`/`RefeicaoStatus` no
 * Spring Boot), fonte única de verdade. Refeições antigas ou ainda só
 * locais (rascunho antes do primeiro save) podem não ter esse campo — nesse
 * caso tratamos como PENDENTE (`undefined`/`null` !== 'CONCLUIDO').
 */
export function refeicaoConcluida(refeicao) {
  return refeicao?.status === 'CONCLUIDO';
}

/**
 * Ordena uma lista de refeições por horário ("HH:mm", ordenável como texto).
 * Função única para esse critério — reaproveitada aqui, em `useRefeicoes.js`
 * (logo após buscar as refeições do dia) e em `CardTimelineDieta.jsx` (Home),
 * para nunca duplicar a mesma comparação em três lugares diferentes.
 */
export function ordenarPorHorario(refeicoes) {
  return [...(refeicoes || [])].sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
}

/**
 * Encontra a próxima refeição pendente do dia: a primeira, em ordem de
 * horário, que ainda não passou E cujo status ainda seja PENDENTE.
 * Refeições já concluídas (mesmo as que já passaram do horário) nunca são
 * retornadas — evita o card "Próxima Refeição" continuar mostrando o Café
 * da Manhã já concluído, ou cair de volta nele no fim do dia. Se todas as
 * refeições do dia já estiverem concluídas, retorna `null`. Usado tanto
 * pela Dieta quanto pela Home.
 */
/** Minutos desde a meia-noite representados por um horário "HH:mm". */
function paraMinutos(horario) {
  const [horas, minutos] = (horario || '00:00').split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Uma refeição pendente é "atrasada" quando seu horário programado já
 * passou. Usado pelo card "Próxima Refeição" para não tratar do mesmo jeito
 * o Café da Manhã que passou das 8h sem ser registrado e o Jantar que ainda
 * vai acontecer às 20h — antes os dois apareciam com o mesmo selo neutro
 * "Aguardando Registro", escondendo que um deles já devia ter sido feito.
 */
export function refeicaoAtrasada(refeicao, agora = new Date()) {
  if (!refeicao || refeicaoConcluida(refeicao)) return false;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  return paraMinutos(refeicao.horario) < minutosAgora;
}

export function obterProximaRefeicao(refeicoes, agora = new Date()) {
  if (!refeicoes || refeicoes.length === 0) return null;

  const pendentes = refeicoes.filter((refeicao) => !refeicaoConcluida(refeicao));
  if (pendentes.length === 0) return null;

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const pendentesOrdenadas = ordenarPorHorario(pendentes);

  const proxima = pendentesOrdenadas.find((refeicao) => paraMinutos(refeicao.horario) >= minutosAgora);

  // Nenhuma pendente com horário ainda por vir: todas já passaram do
  // horário sem registro (ex: é noite e o Café da Manhã nunca foi salvo).
  // Volta a mais antiga do dia — ela será marcada como "atrasada" por
  // `refeicaoAtrasada`, em vez de simplesmente reaparecer como se fosse a
  // próxima refeição normal do dia.
  return proxima || pendentesOrdenadas[0];
}

/**
 * Resumo agregado do progresso do dia em número de refeições (não de
 * macros — isso já existe em `totaisDoDia`/`somarMacrosDeAlimentos`):
 * quantas no total, quantas concluídas e quantas ainda pendentes.
 */
export function calcularResumoRefeicoes(refeicoes) {
  const lista = refeicoes || [];
  const concluidas = lista.filter(refeicaoConcluida).length;

  return {
    total: lista.length,
    concluidas,
    pendentes: lista.length - concluidas,
  };
}