const FALLBACK_EMOJI = '🎯 🏋️‍♂️';

function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const EMOJIS_POR_EXERCICIO = [
  { termos: ['supino', 'crucifixo', 'flexao', 'peck deck'], emoji: '🦍 💥' },
  { termos: ['agachamento', 'leg press', 'extensora', 'flexora', 'stiff', 'afundo', 'passada'], emoji: '🦿 🚀' },
  { termos: ['puxada', 'remada', 'barra fixa', 'pulldown'], emoji: '🦾 🔥' },
  { termos: ['rosca', 'biceps'], emoji: '💪 ⚡' },
  { termos: ['triceps', 'mergulho'], emoji: '🦾 💥' },
  { termos: ['desenvolvimento', 'elevacao lateral', 'elevacao frontal'], emoji: '🏋️‍♂️ 🚀' },
  { termos: ['abdominal', 'prancha', 'crunch'], emoji: '🎯 🔥' },
  { termos: ['panturrilha', 'calf'], emoji: '🦵 ⚡' },
];

const EMOJIS_POR_GRUPO = [
  { termos: ['chest', 'peito', 'pectorals', 'peitoral'], emoji: '🦍 💥' },
  { termos: ['back', 'costas', 'lats', 'dorsais'], emoji: '🦾 🔥' },
  { termos: ['quadriceps', 'quads', 'pernas', 'legs', 'hamstrings', 'posteriores', 'glutes', 'gluteos'], emoji: '🦿 🚀' },
  { termos: ['shoulders', 'ombros', 'delts', 'deltoides'], emoji: '🏋️‍♂️ 🚀' },
  { termos: ['biceps', 'triceps', 'bracos', 'arms'], emoji: '💪 ⚡' },
  { termos: ['abs', 'abdominais', 'core'], emoji: '🎯 🔥' },
  { termos: ['calves', 'panturrilhas'], emoji: '🦵 ⚡' },
];

function encontrarEmoji(texto, mapeamentos) {
  return mapeamentos.find(({ termos }) => termos.some((termo) => texto.includes(termo)))?.emoji;
}

/**
 * Retorna um indicador visual do movimento. O nome do exercício é priorizado
 * para tornar o resultado mais específico; o grupo muscular cobre os demais.
 */
export function obterEmojiExercicio(nomeExercicio, grupoMuscular) {
  const emojiPorNome = encontrarEmoji(normalizarTexto(nomeExercicio), EMOJIS_POR_EXERCICIO);
  if (emojiPorNome) return emojiPorNome;

  return encontrarEmoji(normalizarTexto(grupoMuscular), EMOJIS_POR_GRUPO) || FALLBACK_EMOJI;
}
