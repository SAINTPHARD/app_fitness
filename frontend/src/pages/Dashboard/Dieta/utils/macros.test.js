import assert from 'node:assert/strict';
import test from 'node:test';
import { validarValoresAlimento } from './macros.js';

test('rejeita quantidade vazia, zero ou negativa', () => {
  for (const quantidade of ['', 0, -1]) {
    assert.equal(validarValoresAlimento({ quantidade }), 'A quantidade deve ser maior que 0');
  }
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
