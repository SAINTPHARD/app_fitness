import { Beef, Droplet, Droplets, Flame, Wheat } from 'lucide-react';
import { formatar1Casa, formatarInteiro } from './formatadores';

/**
 * Paleta de acento de cada macro. As classes precisam ser strings literais
 * completas — o Tailwind faz varredura estática do código-fonte e não gera
 * CSS para nomes montados em tempo de execução (`bg-${cor}-500` não funciona).
 *
 * "Calorias" usa o token da marca (`--brand`, teal) em vez de uma cor solta:
 * é a métrica-cabeçalho do dia e deve acompanhar o tema junto com os botões
 * primários. Os demais macros mantêm hues próprios só para diferenciação
 * visual na varredura rápida da grade.
 */
export const CORES_MACRO = {
  brand: { icone: 'text-brand', fundoIcone: 'bg-brand-soft', barra: 'bg-brand' },
  blue: { icone: 'text-blue-500', fundoIcone: 'bg-blue-50 dark:bg-blue-500/10', barra: 'bg-blue-500' },
  amber: { icone: 'text-amber-500', fundoIcone: 'bg-amber-50 dark:bg-amber-500/10', barra: 'bg-amber-500' },
  rose: { icone: 'text-rose-500', fundoIcone: 'bg-rose-50 dark:bg-rose-500/10', barra: 'bg-rose-500' },
  cyan: { icone: 'text-cyan-500', fundoIcone: 'bg-cyan-50 dark:bg-cyan-500/10', barra: 'bg-cyan-500' },
};

/**
 * Monta, a partir do resumo nutricional do dia, os cinco blocos exibidos na
 * grade do cartão "Plano de hoje". É uma função pura: recebe totais/metas já
 * calculados e devolve apenas dados de apresentação, sem tocar em estado nem
 * em React — assim a regra de "o que aparece na grade" pode ser testada e
 * alterada sem mexer no JSX.
 *
 * @param {object} resumo
 * @param {object} resumo.totaisDoDia   Totais consumidos hoje (do backend).
 * @param {object} resumo.metas         Metas do usuário.
 * @param {object} resumo.percentuais   Percentuais já calculados por macro.
 * @param {{ totalMl: number, metaMl: number }} resumo.agua
 */
export function montarBlocosMacro({ totaisDoDia, metas, percentuais, agua }) {
  const caloriasConsumidas = Math.round(Number(totaisDoDia.calorias) || 0);
  const metaCalorias = Math.round(Number(metas.calorias) || 0);
  const caloriasRestantes = Math.max(metaCalorias - caloriasConsumidas, 0);

  return [
    {
      chave: 'calorias',
      rotulo: 'Calorias',
      Icone: Flame,
      cor: 'brand',
      consumido: formatarInteiro(totaisDoDia.calorias),
      meta: formatarInteiro(metas.calorias),
      unidade: 'kcal',
      percentual: percentuais.calorias,
      notaExtra: `${formatarInteiro(caloriasRestantes)} kcal restantes`,
    },
    {
      chave: 'proteina',
      rotulo: 'Proteínas',
      Icone: Beef,
      cor: 'blue',
      consumido: formatar1Casa(totaisDoDia.proteina),
      meta: formatarInteiro(metas.proteinas),
      unidade: 'g',
      percentual: percentuais.proteina,
    },
    {
      chave: 'carboidratos',
      rotulo: 'Carboidratos',
      Icone: Wheat,
      cor: 'amber',
      consumido: formatar1Casa(totaisDoDia.carboidratos),
      meta: formatarInteiro(metas.carboidratos),
      unidade: 'g',
      percentual: percentuais.carboidratos,
    },
    {
      chave: 'gordura',
      rotulo: 'Gorduras',
      Icone: Droplet,
      cor: 'rose',
      consumido: formatar1Casa(totaisDoDia.gordura),
      meta: formatarInteiro(metas.gorduras),
      unidade: 'g',
      percentual: percentuais.gordura,
    },
    {
      chave: 'agua',
      rotulo: 'Água',
      Icone: Droplets,
      cor: 'cyan',
      consumido: formatar1Casa(agua.totalMl / 1000),
      meta: formatar1Casa(agua.metaMl / 1000),
      unidade: 'L',
      percentual: percentuais.agua,
    },
  ];
}
