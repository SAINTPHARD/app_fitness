// Mapa de palavras-chave -> emoji, usado para dar identidade visual rápida a
// cada alimento e quebrar a monotonia de uma lista só de texto.
const MAPA_EMOJI_ALIMENTO = [
  [['arroz'], '🍚'],
  [['feijao', 'feijão'], '🫘'],
  [['frango', 'peito'], '🍗'],
  [['carne', 'bife', 'boi'], '🥩'],
  [['ovo'], '🥚'],
  [['peixe', 'salmao', 'salmão', 'tilapia', 'tilápia'], '🐟'],
  [['salada', 'alface', 'verdura'], '🥗'],
  [['batata'], '🥔'],
  [['macarrao', 'macarrão', 'massa'], '🍝'],
  [['pao', 'pão', 'torrada'], '🍞'],
  [['banana'], '🍌'],
  [['maca', 'maçã'], '🍎'],
  [['leite'], '🥛'],
  [['queijo'], '🧀'],
  [['iogurte'], '🍦'],
  [['aveia', 'granola'], '🌾'],
  [['brocolis', 'brócolis'], '🥦'],
  [['tomate'], '🍅'],
  [['whey', 'shake', 'suplemento'], '🥤'],
  [['cafe', 'café'], '☕'],
];

const EMOJI_PADRAO = '🍽️';

export function obterEmojiAlimento(nomeAlimento) {
  const nomeNormalizado = nomeAlimento.toLowerCase();
  const correspondencia = MAPA_EMOJI_ALIMENTO.find(([palavrasChave]) =>
    palavrasChave.some((palavra) => nomeNormalizado.includes(palavra))
  );
  return correspondencia ? correspondencia[1] : EMOJI_PADRAO;
}

// Paleta de fundos pastel rotativa para os ícones dos alimentos — dá
// variedade visual sem precisar de uma cor fixa por alimento.
export const PALETA_FUNDO_ICONE = [
  'bg-orange-100',
  'bg-emerald-100',
  'bg-sky-100',
  'bg-amber-100',
  'bg-purple-100',
  'bg-rose-100',
];

// Mapa de palavras-chave -> emoji do TIPO de refeição (não do alimento), usado
// no ícone que abre cada linha do accordion de "Refeições do dia".
const MAPA_EMOJI_REFEICAO = [
  [['café', 'cafe'], '☀️'],
  [['almoço', 'almoco'], '🍚'],
  [['lanche'], '🍌'],
  [['pré', 'pre treino', 'pré-treino'], '💪'],
  [['pós', 'pos treino', 'pós-treino'], '🥤'],
  [['jantar'], '🌙'],
  [['ceia'], '🌜'],
];

const EMOJI_REFEICAO_PADRAO = '🍽️';

export function obterEmojiRefeicao(nomeRefeicao) {
  const nomeNormalizado = nomeRefeicao.toLowerCase();
  const correspondencia = MAPA_EMOJI_REFEICAO.find(([palavrasChave]) =>
    palavrasChave.some((palavra) => nomeNormalizado.includes(palavra))
  );
  return correspondencia ? correspondencia[1] : EMOJI_REFEICAO_PADRAO;
}
