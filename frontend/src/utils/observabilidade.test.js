import test from 'node:test';
import assert from 'node:assert/strict';
import { identificarFluxo, normalizarRota } from './observabilidade.js';

test('remove query strings e identificadores de rotas observadas', () => {
  assert.equal(normalizarRota('/usuarios/123/refeicoes?email=privado@example.com'), '/usuarios/:id/refeicoes');
});

test('classifica apenas fluxos operacionais conhecidos', () => {
  assert.equal(identificarFluxo('/auth/login'), 'login');
  assert.equal(identificarFluxo('/api/sessoes-treino/42'), 'treino');
  assert.equal(identificarFluxo('/usuarios/42'), null);
});
