const MUSCULO_VALIDO = /^[a-z][a-z0-9 _-]{0,49}$/;

const MUSCULOS_CATALOGO = {
  pectorals: 'chest',
  quads: 'quadriceps',
  lats: 'back',
  delts: 'shoulders',
  abs: 'core',
  pernas: 'quadriceps',
  posterior: 'hamstrings',
  femoral: 'hamstrings',
  'posterior de coxa': 'hamstrings',
  gluteo: 'glutes',
  gluteos: 'glutes',
  panturrilha: 'calves',
  panturrilhas: 'calves',
};

export function normalizarMusculoCatalogo(musculo) {
  const normalizado = typeof musculo === 'string'
    ? musculo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
    : '';
  if (!MUSCULO_VALIDO.test(normalizado)) return '';
  return MUSCULOS_CATALOGO[normalizado] || normalizado;
}

export function normalizarRespostaCatalogo(dados) {
  return Array.isArray(dados) ? dados : [];
}

const TRADUCOES = {
  beginner: 'Iniciante', intermediate: 'Intermediário', expert: 'Avançado', body_only: 'Peso corporal',
  dumbbell: 'Halteres', barbell: 'Barra', cable: 'Cabo', machine: 'Máquina', chest: 'Peitoral',
  pectorals: 'Peitoral', biceps: 'Bíceps', triceps: 'Tríceps', quadriceps: 'Quadríceps',
  hamstrings: 'Posteriores de coxa', glutes: 'Glúteos', back: 'Costas', shoulders: 'Ombros',
  core: 'Abdômen', calves: 'Panturrilhas',
};

export function traduzirMetadadoCatalogo(valor) {
  const original = String(valor ?? '').trim();
  if (!original) return '';
  const chave = original.toLowerCase().replace(/[ -]+/g, '_');
  return TRADUCOES[chave] || original.replaceAll('_', ' ');
}

export function mensagemErroCatalogo(error) {
  const dados = error?.response?.data;

  if (Array.isArray(dados?.mensagens) && dados.mensagens.length > 0) {
    return dados.mensagens[0];
  }

  return dados?.message || dados?.mensagem || 'Não foi possível carregar o catálogo de exercícios.';
}
