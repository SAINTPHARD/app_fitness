import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calcularImc, classificarImc, normalizarAlturaCm } from './imc.js';

describe('calcularImc', () => {
  test('calcula o IMC corretamente para peso e altura em cm', () => {
    // 70kg / (1.75m)^2 = 22.857... -> arredondado para 22.9
    assert.equal(calcularImc(70, 175), 22.9);
  });

  test('retorna null quando falta peso ou altura', () => {
    assert.equal(calcularImc(null, 175), null);
    assert.equal(calcularImc(70, null), null);
    assert.equal(calcularImc(0, 175), null);
  });

  test('barra IMCs implausíveis causados por altura salva em metros (bug de unidade)', () => {
    // 70kg / (0.0182m)^2 -> IMC absurdo se "1.82" fosse tratado como cm direto
    assert.equal(calcularImc(70, 1.82), null);
  });

  test('não retorna IMC fora da faixa humana plausível (5-100)', () => {
    assert.equal(calcularImc(700, 50), null); // IMC 2800 — implausível
  });
});

describe('classificarImc', () => {
  test('classifica corretamente as faixas da OMS', () => {
    assert.equal(classificarImc(17), 'Abaixo do peso');
    assert.equal(classificarImc(22), 'Peso normal');
    assert.equal(classificarImc(27), 'Sobrepeso');
    assert.equal(classificarImc(32), 'Obesidade');
  });

  test('retorna null para IMC ausente', () => {
    assert.equal(classificarImc(null), null);
    assert.equal(classificarImc(undefined), null);
  });
});

describe('normalizarAlturaCm (correção P1.1 — migração de altura salva em metros)', () => {
  test('converte valores plausíveis de metros para cm', () => {
    assert.equal(normalizarAlturaCm(1.82), 182);
    assert.equal(normalizarAlturaCm(1.6), 160);
  });

  test('mantém valores já em cm inalterados', () => {
    assert.equal(normalizarAlturaCm(182), 182);
    assert.equal(normalizarAlturaCm(160.5), 160.5);
  });

  test('retorna null para entradas inválidas', () => {
    assert.equal(normalizarAlturaCm(0), null);
    assert.equal(normalizarAlturaCm(-1), null);
    assert.equal(normalizarAlturaCm(null), null);
    assert.equal(normalizarAlturaCm('abc'), null);
  });
});
