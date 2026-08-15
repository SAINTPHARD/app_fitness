/**
 * Validação nativa e rigorosa das metas diárias (o projeto não tem a
 * dependência `zod` instalada — em vez de adicioná-la só para este formulário,
 * usamos validação nativa explícita, mais transparente para manter).
 *
 * Regras aplicadas a cada campo (calorias, proteínas, carboidratos, gorduras, água):
 *  - não pode estar vazio;
 *  - precisa ser um número válido;
 *  - não pode ser negativo;
 *  - calorias, especificamente, precisa ser maior que zero (é a meta principal).
 *
 * Retorna `{ valido, erros }`, onde `erros` mapeia campo -> mensagem, pronto
 * para ser exibido diretamente abaixo de cada input no ModalMetas.
 */
const LIMITES = {
  calorias: { min: 1, max: 10000, unidade: 'kcal' },
  proteinas: { min: 0, max: 1000, unidade: 'g' },
  carboidratos: { min: 0, max: 1500, unidade: 'g' },
  gorduras: { min: 0, max: 500, unidade: 'g' },
  aguaMl: { min: 250, max: 10000, unidade: 'ml' },
};

const CAMPOS_OBRIGATORIOS = Object.keys(LIMITES);

export function validarMetas(metas) {
  const erros = {};

  CAMPOS_OBRIGATORIOS.forEach((campo) => {
    const valorBruto = metas[campo];

    if (valorBruto === '' || valorBruto === null || valorBruto === undefined) {
      erros[campo] = 'Campo obrigatório.';
      return;
    }

    const valorNumerico = Number(valorBruto);

    if (!Number.isFinite(valorNumerico)) {
      erros[campo] = 'Informe um número válido.';
      return;
    }

    const limite = LIMITES[campo];

    if (valorNumerico < limite.min) {
      erros[campo] =
        limite.min === 0
          ? 'O valor não pode ser negativo.'
          : `Informe ao menos ${limite.min} ${limite.unidade}.`;
      return;
    }

    if (valorNumerico > limite.max) {
      erros[campo] = `Informe no máximo ${limite.max} ${limite.unidade}.`;
    }
  });

  return { valido: Object.keys(erros).length === 0, erros };
}
