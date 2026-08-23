import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mensagemErroCatalogo,
  normalizarMusculoCatalogo,
  normalizarRespostaCatalogo,
} from './catalogoExerciciosApi.js';

test('traduz os ids legados do dropdown para o contrato do catálogo local', () => {
  assert.equal(normalizarMusculoCatalogo('pectorals'), 'chest');
  assert.equal(normalizarMusculoCatalogo('quads'), 'quadriceps');
  assert.equal(normalizarMusculoCatalogo('lats'), 'back');
  assert.equal(normalizarMusculoCatalogo('delts'), 'shoulders');
  assert.equal(normalizarMusculoCatalogo('abs'), 'core');
});

test('normaliza aliases de membros inferiores em português', () => {
  assert.equal(normalizarMusculoCatalogo('pernas'), 'quadriceps');
  assert.equal(normalizarMusculoCatalogo('posterior de coxa'), 'hamstrings');
  assert.equal(normalizarMusculoCatalogo('femoral'), 'hamstrings');
  assert.equal(normalizarMusculoCatalogo('Glúteos'), 'glutes');
  assert.equal(normalizarMusculoCatalogo('GLUTEO'), 'glutes');
  assert.equal(normalizarMusculoCatalogo('panturrilhas'), 'calves');
  assert.equal(normalizarMusculoCatalogo('panturrilha'), 'calves');
  assert.equal(normalizarMusculoCatalogo('posterior_de_coxa'), 'hamstrings');
});

test('normaliza um músculo válido', () => {
  assert.equal(normalizarMusculoCatalogo('  PECTORALS '), 'chest');
});

test('rejeita músculo ausente ou com caracteres inválidos', () => {
  assert.equal(normalizarMusculoCatalogo(undefined), '');
  assert.equal(normalizarMusculoCatalogo('peito/../../'), '');
  assert.equal(normalizarMusculoCatalogo(''), '');
});

test('aceita somente arrays como resposta do catálogo', () => {
  const exercicios = [{ id: '1', name: 'Bench press' }];
  assert.equal(normalizarRespostaCatalogo(exercicios), exercicios);
  assert.deepEqual(normalizarRespostaCatalogo(undefined), []);
  assert.deepEqual(normalizarRespostaCatalogo({ data: exercicios }), []);
});

test('prioriza a mensagem padronizada do backend', () => {
  const error = { response: { data: { mensagens: ['Fornecedor indisponível.'] } } };
  assert.equal(mensagemErroCatalogo(error), 'Fornecedor indisponível.');
  assert.equal(mensagemErroCatalogo(null), 'Não foi possível carregar o catálogo de exercícios.');
});
