import assert from 'node:assert/strict';
import test from 'node:test';
import { obterErroSerie } from './validarSerie.js';

test('exige carga maior que zero', () => {
  assert.equal(obterErroSerie('', 10), 'Informe a carga');
  assert.equal(obterErroSerie(0, 10), 'Informe a carga');
});

test('exige repetições inteiras maiores que zero', () => {
  assert.equal(obterErroSerie(20, ''), 'Informe as repetições');
  assert.equal(obterErroSerie(20, 0), 'Informe as repetições');
  assert.equal(obterErroSerie(20, 1.5), 'Informe as repetições');
});

test('aceita série com carga e repetições positivas', () => {
  assert.equal(obterErroSerie(20, 10), null);
});
