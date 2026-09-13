import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarRegistroPeso, validarMetas, validarQuantidadeAgua } from './regrasDominio.js';

describe('validações canônicas de domínio', () => {
  it('normaliza valores físicos válidos', () => {
    assert.equal(validarQuantidadeAgua('250'), 250);
    assert.equal(normalizarRegistroPeso({ data: '2026-08-31', peso: '72.5' }).peso, 72.5);
  });

  it('rejeita limites fisicamente inválidos', () => {
    assert.throws(() => validarQuantidadeAgua(5001), /5000 ml/);
    assert.throws(() => normalizarRegistroPeso({ data: '2026-08-31', peso: 10 }), /20 e 300/);
  });

  it('valida todas as metas antes da requisição', () => {
    assert.throws(() => validarMetas({ calorias: 2000, proteinas: 150, carboidratos: 250, gorduras: 65, aguaMl: 100 }), /aguaMl/);
  });
});
