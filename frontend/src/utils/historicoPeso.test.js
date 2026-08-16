import assert from 'node:assert/strict';
import test from 'node:test';
import { obterUltimoRegistroPeso } from './historicoPeso.js';

test('obtém o peso do registro mais recente mesmo quando a API retorna fora de ordem', () => {
  const ultimo = obterUltimoRegistroPeso([
    { data: '2026-08-15', peso: 78 },
    { data: '2026-08-13', peso: 80 },
    { data: '2026-08-14', peso: 79 },
  ]);

  assert.deepEqual(ultimo, { data: '2026-08-15', peso: 78 });
});

test('retorna null quando não há histórico', () => {
  assert.equal(obterUltimoRegistroPeso([]), null);
});
