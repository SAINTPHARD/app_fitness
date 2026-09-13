import test from 'node:test';
import assert from 'node:assert/strict';
import { ehDiaDeDescanso } from './diasSemana.js';

test('marca somente o descanso total programado', () => {
  assert.equal(ehDiaDeDescanso('domingo'), true);
  assert.equal(ehDiaDeDescanso('sabado'), false);
});
