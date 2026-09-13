import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularMetaHidratacao, validarMetasOnboarding } from './onboardingUtils.js';

describe('metas do onboarding', () => {
  test('calcula 35 ml por kg e arredonda para múltiplos de 50 ml', () => {
    assert.equal(calcularMetaHidratacao(70), 2450);
    assert.equal(calcularMetaHidratacao(71), 2500);
  });

  test('rejeita metas fora dos limites aceitos pela API', () => {
    const base = { calorias: 2200, proteinas: 150, carboidratos: 250, gorduras: 70, aguaMl: 2500 };
    assert.equal(validarMetasOnboarding(base), null);
    assert.match(validarMetasOnboarding({ ...base, calorias: 0 }), /Calorias/);
    assert.match(validarMetasOnboarding({ ...base, aguaMl: 12000 }), /Hidratação/);
  });
});
