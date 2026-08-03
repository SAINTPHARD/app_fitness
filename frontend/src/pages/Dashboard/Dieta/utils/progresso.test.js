import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calcularPercentual, metaExcedida, calcularMetaDoDiaPercentual } from './progresso.js';

describe('calcularPercentual', () => {
  test('calcula o percentual consumido/meta, limitado a 100', () => {
    assert.equal(calcularPercentual(50, 100), 50);
    assert.equal(calcularPercentual(150, 100), 100);
  });

  test('retorna 0 quando a meta não foi definida (0 ou ausente)', () => {
    assert.equal(calcularPercentual(50, 0), 0);
    assert.equal(calcularPercentual(50, null), 0);
  });
});

describe('metaExcedida', () => {
  test('true apenas quando há meta definida e o consumido passou dela', () => {
    assert.equal(metaExcedida(120, 100), true);
    assert.equal(metaExcedida(80, 100), false);
    assert.equal(metaExcedida(120, 0), false);
  });
});

describe('calcularMetaDoDiaPercentual (correção P2.6 — card "Meta do dia" só refletia a água)', () => {
  test('é a média de TODOS os indicadores com meta definida, não só a água', () => {
    const percentuais = { calorias: 50, proteina: 100, carboidratos: 0, gordura: 0, agua: 20 };
    // Só calorias(50), proteina(100) e agua(20) têm valor > 0 -> média = 170/3 = 56.67 -> 57
    assert.equal(calcularMetaDoDiaPercentual(percentuais), 57);
  });

  test('não fica igual ao percentual de água quando os outros indicadores divergem', () => {
    const percentuais = { calorias: 80, proteina: 60, carboidratos: 40, gordura: 20, agua: 20 };
    const resultado = calcularMetaDoDiaPercentual(percentuais);
    assert.notEqual(resultado, percentuais.agua);
  });

  test('ignora metas ainda não configuradas (percentual 0) na média', () => {
    const percentuais = { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0, agua: 50 };
    assert.equal(calcularMetaDoDiaPercentual(percentuais), 50);
  });

  test('retorna 0 quando nenhuma meta foi configurada', () => {
    assert.equal(calcularMetaDoDiaPercentual({ calorias: 0, agua: 0 }), 0);
    assert.equal(calcularMetaDoDiaPercentual({}), 0);
  });
});
