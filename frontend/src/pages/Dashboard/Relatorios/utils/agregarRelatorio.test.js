import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularComparacao, montarCsvRelatorio } from './agregarRelatorio.js';

test('calcula comparação percentual com o período anterior', () => {
  assert.equal(calcularComparacao(120, 100), 20);
  assert.equal(calcularComparacao(80, 100), -20);
  assert.equal(calcularComparacao(10, 0), null);
});

test('CSV usa pt-BR, separador compatível e somente a série recebida', () => {
  const csv = montarCsvRelatorio({ serie: [{ data: '2026-08-31', calorias: 2100, aguaMl: 2500, peso: 79.5, sessoes: 1, sessoesConcluidas: 1 }] });
  assert.match(csv, /31\/08\/2026;2100;2500;79,5;1;1/);
  assert.equal(csv.trim().split('\n').length, 2);
});
