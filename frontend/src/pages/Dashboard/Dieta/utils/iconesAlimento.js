import { Apple, Beef, Coffee, CookingPot, CupSoda, Drumstick, Egg, Fish, Milk, Salad, Sandwich, Soup, Sprout, Utensils, Wheat } from 'lucide-react';

const MAPA_ICONE_ALIMENTO = [
  [['arroz', 'feijao', 'feijão', 'macarrao', 'macarrão', 'massa', 'batata'], CookingPot],
  [['frango', 'peito'], Drumstick],
  [['carne', 'bife', 'boi'], Beef],
  [['ovo'], Egg],
  [['peixe', 'salmao', 'salmão', 'tilapia', 'tilápia'], Fish],
  [['salada', 'alface', 'verdura', 'brocolis', 'brócolis', 'tomate'], Salad],
  [['pao', 'pão', 'torrada'], Sandwich],
  [['banana', 'maca', 'maçã'], Apple],
  [['leite', 'queijo', 'iogurte'], Milk],
  [['aveia', 'granola'], Wheat],
  [['whey', 'shake', 'suplemento'], CupSoda],
  [['cafe', 'café'], Coffee],
];

export function obterIconeAlimento(nomeAlimento = '') {
  const nomeNormalizado = nomeAlimento.toLowerCase();
  return MAPA_ICONE_ALIMENTO.find(([palavras]) => palavras.some((palavra) => nomeNormalizado.includes(palavra)))?.[1] || Utensils;
}

export const PALETA_FUNDO_ICONE = ['bg-orange-100', 'bg-emerald-100', 'bg-sky-100', 'bg-amber-100', 'bg-purple-100', 'bg-rose-100'];

const MAPA_ICONE_REFEICAO = [
  [['café', 'cafe'], Coffee],
  [['almoço', 'almoco', 'jantar', 'ceia'], Soup],
  [['lanche'], Apple],
  [['pré', 'pre treino', 'pré-treino', 'pós', 'pos treino', 'pós-treino'], Sprout],
];

export function obterIconeRefeicao(nomeRefeicao = '') {
  const nomeNormalizado = nomeRefeicao.toLowerCase();
  return MAPA_ICONE_REFEICAO.find(([palavras]) => palavras.some((palavra) => nomeNormalizado.includes(palavra)))?.[1] || Utensils;
}
