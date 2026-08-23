// Identidade visual dos exercícios: substitui os emojis por um tile colorido
// por grupamento muscular. As classes são escritas por extenso (sem
// interpolação) para o JIT do Tailwind conseguir detectá-las no build.

const TEMA_PADRAO = {
  fundo: 'bg-zinc-100 dark:bg-zinc-800',
  icone: 'text-zinc-500 dark:text-zinc-400',
};

const TEMAS = [
  {
    termos: ['chest', 'peito', 'peitoral', 'pectorals', 'supino', 'crucifixo', 'flexao', 'peck deck'],
    tema: { fundo: 'bg-rose-100 dark:bg-rose-500/15', icone: 'text-rose-600 dark:text-rose-400' },
  },
  {
    termos: ['back', 'costas', 'lats', 'dorsais', 'puxada', 'remada', 'barra fixa', 'pulldown'],
    tema: { fundo: 'bg-sky-100 dark:bg-sky-500/15', icone: 'text-sky-600 dark:text-sky-400' },
  },
  {
    termos: [
      'quadriceps', 'quads', 'pernas', 'legs', 'hamstrings', 'posteriores', 'glutes', 'gluteos',
      'calves', 'panturrilha', 'agachamento', 'leg press', 'extensora', 'flexora', 'stiff', 'afundo',
    ],
    tema: { fundo: 'bg-amber-100 dark:bg-amber-500/15', icone: 'text-amber-600 dark:text-amber-400' },
  },
  {
    termos: ['shoulders', 'ombros', 'delts', 'deltoides', 'desenvolvimento', 'elevacao lateral', 'elevacao frontal'],
    tema: { fundo: 'bg-violet-100 dark:bg-violet-500/15', icone: 'text-violet-600 dark:text-violet-400' },
  },
  {
    termos: ['biceps', 'triceps', 'bracos', 'arms', 'rosca', 'mergulho', 'pulley'],
    tema: { fundo: 'bg-emerald-100 dark:bg-emerald-500/15', icone: 'text-emerald-600 dark:text-emerald-400' },
  },
  {
    termos: ['abs', 'core', 'abdominais', 'abdominal', 'prancha', 'crunch'],
    tema: { fundo: 'bg-teal-100 dark:bg-teal-500/15', icone: 'text-teal-600 dark:text-teal-400' },
  },
];

/** Minúsculas, sem acentos e sem espaços nas pontas — base de busca/comparação. */
export function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Tema de cor do tile a partir do nome do exercício (prioritário) ou do grupo. */
export function obterTemaExercicio(nomeExercicio, grupoMuscular) {
  const nome = normalizarTexto(nomeExercicio);
  const grupo = normalizarTexto(grupoMuscular);
  const encontrado = TEMAS.find(({ termos }) =>
    termos.some((termo) => nome.includes(termo) || (grupo !== '' && grupo.includes(termo))),
  );
  return encontrado?.tema || TEMA_PADRAO;
}

/** true quando a URL é um http(s) utilizável em <img src>. */
export function ehUrlMidiaValida(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

function numeroPositivo(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

/**
 * Linha secundária do card: "4 séries x 8 rep." quando há dados; senão cai
 * para o grupamento muscular e, por último, para um texto neutro.
 * Nunca retorna "undefined" ou "?" na tela.
 */
export function descreverExercicio(exercicio, totalSeriesRegistradas = 0) {
  const series = numeroPositivo(exercicio?.series) ?? numeroPositivo(totalSeriesRegistradas);
  const repeticoes = numeroPositivo(exercicio?.repeticoes);

  if (series && repeticoes) return `${series} séries x ${repeticoes} rep.`;
  if (series) return `${series} ${series === 1 ? 'série' : 'séries'}`;

  const grupo = String(exercicio?.grupoMuscular ?? '').trim();
  if (grupo) return grupo;

  const descricao = String(exercicio?.descricao ?? '').trim();
  if (descricao) return descricao.length > 60 ? `${descricao.slice(0, 57)}…` : descricao;

  return 'Séries livres';
}
