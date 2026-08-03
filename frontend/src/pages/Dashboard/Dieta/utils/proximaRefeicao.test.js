import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { obterProximaRefeicao, refeicaoAtrasada, refeicaoConcluida } from './proximaRefeicao.js';

// Fixa um horário de referência em vez de usar `new Date()` — os testes
// injetam `agora` explicitamente em vez de depender do relógio real da
// máquina que roda o CI.
const MANHA = new Date(2026, 6, 28, 7, 0); // 07:00
const NOITE = new Date(2026, 6, 28, 22, 0); // 22:00

const refeicoesDoDia = [
  { id: 1, nome: 'Café da manhã', horario: '08:00', status: 'PENDENTE' },
  { id: 2, nome: 'Almoço', horario: '13:00', status: 'PENDENTE' },
  { id: 3, nome: 'Lanche', horario: '16:30', status: 'PENDENTE' },
  { id: 4, nome: 'Jantar', horario: '20:00', status: 'PENDENTE' },
];

describe('obterProximaRefeicao (correção P2.7 — sempre retornava a primeira pendente, ignorando o horário)', () => {
  test('de manhã cedo, a próxima é a primeira refeição do dia', () => {
    const proxima = obterProximaRefeicao(refeicoesDoDia, MANHA);
    assert.equal(proxima.nome, 'Café da manhã');
  });

  test('à noite, não volta a mostrar o Café da Manhã como se fosse "a próxima" normal — mostra o Jantar', () => {
    const refeicoesComCafeConcluido = refeicoesDoDia.map((r) =>
      r.nome === 'Café da manhã' || r.nome === 'Almoço' || r.nome === 'Lanche'
        ? { ...r, status: 'CONCLUIDO' }
        : r
    );
    const proxima = obterProximaRefeicao(refeicoesComCafeConcluido, NOITE);
    assert.equal(proxima.nome, 'Jantar');
  });

  test('à noite com o Café da Manhã nunca registrado, cai de volta para ele (mas marcado como atrasado, ver refeicaoAtrasada)', () => {
    const proxima = obterProximaRefeicao(refeicoesDoDia, NOITE);
    assert.equal(proxima.nome, 'Café da manhã');
    assert.equal(refeicaoAtrasada(proxima, NOITE), true);
  });

  test('retorna null quando todas as refeições já foram concluídas', () => {
    const todasConcluidas = refeicoesDoDia.map((r) => ({ ...r, status: 'CONCLUIDO' }));
    assert.equal(obterProximaRefeicao(todasConcluidas, MANHA), null);
  });

  test('retorna null para lista vazia', () => {
    assert.equal(obterProximaRefeicao([], MANHA), null);
  });
});

describe('refeicaoAtrasada', () => {
  test('refeição pendente com horário já passado é atrasada', () => {
    const refeicao = { horario: '08:00', status: 'PENDENTE' };
    assert.equal(refeicaoAtrasada(refeicao, NOITE), true);
  });

  test('refeição pendente com horário futuro não é atrasada', () => {
    const refeicao = { horario: '20:00', status: 'PENDENTE' };
    assert.equal(refeicaoAtrasada(refeicao, MANHA), false);
  });

  test('refeição concluída nunca é atrasada, mesmo com horário no passado', () => {
    const refeicao = { horario: '08:00', status: 'CONCLUIDO' };
    assert.equal(refeicaoAtrasada(refeicao, NOITE), false);
  });
});

describe('refeicaoConcluida', () => {
  test('só é true quando status é exatamente CONCLUIDO', () => {
    assert.equal(refeicaoConcluida({ status: 'CONCLUIDO' }), true);
    assert.equal(refeicaoConcluida({ status: 'PENDENTE' }), false);
    assert.equal(refeicaoConcluida({}), false);
    assert.equal(refeicaoConcluida(null), false);
  });
});
