/**
 * Validação nativa e rigorosa das metas diárias (o projeto não tem a
 * dependência `zod` instalada — em vez de adicioná-la só para este formulário,
 * usamos validação nativa explícita, mais transparente para manter).
 *
 * Regras aplicadas a cada campo (calorias, proteínas, carboidratos, gorduras):
 *  - não pode estar vazio;
 *  - precisa ser um número válido;
 *  - não pode ser negativo;
 *  - calorias, especificamente, precisa ser maior que zero (é a meta principal).
 *
 * Retorna `{ valido, erros }`, onde `erros` mapeia campo -> mensagem, pronto
 * para ser exibido diretamente abaixo de cada input no ModalMetas.
 */
const CAMPOS_OBRIGATORIOS = ['calorias', 'proteinas', 'carboidratos', 'gorduras'];

export function validarMetas(metas) {
  const erros = {};

  CAMPOS_OBRIGATORIOS.forEach((campo) => {
    const valorBruto = metas[campo];

    if (valorBruto === '' || valorBruto === null || valorBruto === undefined) {
      erros[campo] = 'Campo obrigatório.';
      return;
    }

    const valorNumerico = Number(valorBruto);

    if (Number.isNaN(valorNumerico)) {
      erros[campo] = 'Informe um número válido.';
      return;
    }

    if (valorNumerico < 0) {
      erros[campo] = 'O valor não pode ser negativo.';
      return;
    }

    if (campo === 'calorias' && valorNumerico === 0) {
      erros[campo] = 'A meta de calorias deve ser maior que zero.';
    }
  });

  return { valido: Object.keys(erros).length === 0, erros };
}
