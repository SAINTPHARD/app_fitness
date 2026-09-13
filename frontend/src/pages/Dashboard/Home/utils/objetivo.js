/**
 * Rótulo em português do objetivo cadastrado no Perfil/Onboarding — usado na
 * badge do cartão "Plano de hoje" para a meta calculada refletir o objetivo
 * real do usuário, em vez de um texto fixo igual para todo mundo.
 */
const ROTULO_OBJETIVO = {
  EMAGRECER: 'emagrecimento',
  MANTER: 'manutenção',
  HIPERTROFIA: 'hipertrofia',
};

/** Devolve `null` (e não um texto genérico) quando o perfil ainda não tem
 *  objetivo definido, para a badge simplesmente não aparecer. */
export const obterRotuloObjetivo = (objetivo) => ROTULO_OBJETIVO[objetivo] || null;
