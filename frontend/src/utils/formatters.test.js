import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatarNumero, formatarInteiro } from './formatters.js';

describe('formatarNumero (correção P1.5 — erro de ponto flutuante na UI)', () => {
  test('arredonda dízimas de ponto flutuante em vez de exibir cruas', () => {
    // Soma clássica de ponto flutuante que produz 113.19999999999999
    const somaComErro = 0.1 + 113.09999999999999;
    assert.equal(formatarNumero(somaComErro, 1), '113,2');
  });

  test('respeita a quantidade de casas decimais pedida', () => {
    assert.equal(formatarNumero(12.3456, 2), '12,35');
    assert.equal(formatarNumero(12, 1), '12');
  });

  test('evita "-0,0" para valores negativos muito próximos de zero', () => {
    assert.equal(formatarNumero(-0.00001, 1), '0');
  });

  test('retorna "0" para valores inválidos', () => {
    assert.equal(formatarNumero(null), '0');
    assert.equal(formatarNumero(undefined), '0');
    assert.equal(formatarNumero('abc'), '0');
  });
});

describe('formatarInteiro', () => {
  test('arredonda para o inteiro mais próximo', () => {
    assert.equal(formatarInteiro(113.6), '114');
    assert.equal(formatarInteiro(113.19999999999999), '113');
  });

  test('retorna "0" para valores inválidos', () => {
    assert.equal(formatarInteiro('abc'), '0');
  });
});
