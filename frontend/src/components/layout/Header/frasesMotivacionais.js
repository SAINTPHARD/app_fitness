/** Saudação de acordo com o horário do dispositivo. */
export function obterSaudacaoPorHorario() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

const FRASES_MOTIVACIONAIS = [
  'Cada refeição registrada é um passo mais perto do seu objetivo.',
  'Pequenas escolhas de hoje constroem o resultado de amanhã.',
  'Consistência vale mais que perfeição — continue registrando.',
  'Beber água agora é um favor que você faz ao seu futuro.',
  'Você não precisa ser perfeito, só precisa continuar.',
  'Um dia de cada vez. Hoje já é um bom dia para avançar.',
];

/**
 * Frase que troca uma vez por dia (não a cada render), calculada a partir
 * do dia do ano — dá a sensação de "mensagem do dia" sem precisar de backend.
 */
export function obterFraseMotivacionalDoDia() {
  const hoje = new Date();
  const inicioDoAno = new Date(hoje.getFullYear(), 0, 0);
  const diaDoAno = Math.floor((hoje - inicioDoAno) / 86400000);
  return FRASES_MOTIVACIONAIS[diaDoAno % FRASES_MOTIVACIONAIS.length];
}
