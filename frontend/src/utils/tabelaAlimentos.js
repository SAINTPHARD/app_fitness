// src/utils/tabelaAlimentos.js

// 1. A  BASE DE DADOS LOCAL (Alimentos Verificados com ⭐)
export const TABELA_ALIMENTOS = [
  { id: 1, nome: 'Arroz Branco Cozido', pesoReferenciaG: 100, proteina: 2.5, carboidratos: 28.1, gordura: 0.2 },
  { id: 2, nome: 'Feijão Preto Cozido', pesoReferenciaG: 100, proteina: 4.5, carboidratos: 14.0, gordura: 0.5 },
  { id: 3, nome: 'Peito de Frango Grelhado', pesoReferenciaG: 100, proteina: 31.5, carboidratos: 0, gordura: 3.6 },
  { id: 4, nome: 'Ovo de Galinha Cozido', pesoReferenciaG: 50, proteina: 6.5, carboidratos: 0.5, gordura: 5.0 }, // 1 ovo tem aprox. 50g
  { id: 5, nome: 'Batata Doce Cozida', pesoReferenciaG: 100, proteina: 1.6, carboidratos: 20.1, gordura: 0.1 },
  { id: 6, nome: 'Banana Prata', pesoReferenciaG: 100, proteina: 1.3, carboidratos: 26.0, gordura: 0.3 },
  { id: 7, nome: 'Aveia em Flocos', pesoReferenciaG: 100, proteina: 14.0, carboidratos: 66.0, gordura: 7.0 },
  { id: 8, nome: 'Carne Moída (Patinho)', pesoReferenciaG: 100, proteina: 35.9, carboidratos: 0, gordura: 7.3 },
  { id: 9, nome: 'Azeite de Oliva', pesoReferenciaG: 13, proteina: 0, carboidratos: 0, gordura: 12.0 }, // 1 colher de sopa
  { id: 10, nome: 'Pão Francês', pesoReferenciaG: 50, proteina: 4.7, carboidratos: 29.3, gordura: 1.6 }
];

// 2. FUNÇÃO QUE BUSCA NA NOSSA TABELA (Super Rápida)
export function buscarAlimentos(termo) {
  if (!termo || termo.trim().length < 2) return [];
  
  const termoMinusculo = termo.toLowerCase();
  return TABELA_ALIMENTOS.filter(alimento => 
    alimento.nome.toLowerCase().includes(termoMinusculo)
  );
}

// 3. FORMULA DE MATEMÁTICA (Calcula os macros para 150g, 200g, etc.)
export function calcularMacrosProporcionais(alimentoRef, quantidadeG) {
  if (!alimentoRef || !quantidadeG || quantidadeG <= 0) {
    return { proteina: 0, carboidratos: 0, gordura: 0 };
  }

  // Função interna para travar em 1 casa decimal e eliminar as dízimas periódicas do JS
  const travarDecimal = (valor, multiplicador) => parseFloat((Number(valor) * Number(multiplicador)).toFixed(1));

  // Se o alimento veio da INTERNET (Open Food Facts):
  // A API já envia os valores divididos por 1 grama, então basta multiplicar!
  if (alimentoRef.protPorGrama !== undefined) {
    return {
      proteina: travarDecimal(alimentoRef.protPorGrama, quantidadeG),
      carboidratos: travarDecimal(alimentoRef.carboPorGrama, quantidadeG),
      gordura: travarDecimal(alimentoRef.gordPorGrama, quantidadeG),
    };
  }

  // Se o alimento veio da TABELA LOCAL (Arroz, Frango, etc.):
  // Calculamos a Regra de 3 simples baseada no 'pesoReferenciaG' (ex: se 100g tem 28g carbo, quanto tem 150g?)
  const fator = quantidadeG / (alimentoRef.pesoReferenciaG || 100);
  
  return {
    proteina: travarDecimal(alimentoRef.proteina || 0, fator),
    carboidratos: travarDecimal(alimentoRef.carboidratos || 0, fator),
    gordura: travarDecimal(alimentoRef.gordura || 0, fator),
  };
}