import assert from 'node:assert/strict';
import test from 'node:test';
import { validarValoresAlimento } from './macros.js';

test('rejeita quantidade vazia, zero ou negativa', () => {
  for (const quantidade of ['', 0, -1]) {
    assert.equal(
      validarValoresAlimento({ quantidade }),
      'Informe uma quantidade válida (ex: 150g, 200ml, 1l ou 2 unidades)'
    );
  }
});

test('mantém a mensagem canônica para texto sem quantidade numérica', () => {
  assert.equal(
    validarValoresAlimento({ quantidade: 'duas porções' }),
    'Informe uma quantidade válida (ex: 150g, 200ml, 1l ou 2 unidades)'
  );
});

test('rejeita macronutriente negativo', () => {
  assert.equal(
    validarValoresAlimento({ quantidade: 100, proteina: -1, carboidratos: 0, gordura: 0 }),
    'Os macronutrientes não podem ser negativos'
  );
});

test('aceita quantidade positiva e macros iguais a zero', () => {
  assert.equal(
    validarValoresAlimento({ quantidade: 100, proteina: 0, carboidratos: 0, gordura: 0 }),
    null
  );
});
