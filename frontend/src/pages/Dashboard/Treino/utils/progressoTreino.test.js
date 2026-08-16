import assert from 'node:assert/strict';
import test from 'node:test';
import { contarExerciciosConcluidos, exercicioEstaConcluido } from './progressoTreino.js';

test('não conclui exercício com séries parciais', () => {
  assert.equal(
    exercicioEstaConcluido([{ status: 'CONCLUIDA' }, { status: 'EM_ANDAMENTO' }]),
    false
  );
});

test('só conclui exercício quando todas as séries estão concluídas', () => {
  assert.equal(exercicioEstaConcluido([{ status: 'CONCLUIDA' }, { status: 'CONCLUIDA' }]), true);
  assert.equal(exercicioEstaConcluido([]), false);
});

test('conta somente exercícios integralmente concluídos', () => {
  const seriesPorExercicio = {
    1: [{ status: 'CONCLUIDA' }, { status: 'CONCLUIDA' }],
    2: [{ status: 'CONCLUIDA' }, { status: 'EM_ANDAMENTO' }],
  };

  assert.equal(contarExerciciosConcluidos([{ id: 1 }, { id: 2 }], (id) => seriesPorExercicio[id]), 1);
});
