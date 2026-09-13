import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { criarDataLocal, ehDataCivilValida, formatarDataCivil } from './dataCivil.js';

describe('contrato de data civil local', () => {
  it('formata com componentes locais sem converter para UTC', () => {
    assert.equal(formatarDataCivil(new Date(2026, 0, 2, 0, 15)), '2026-01-02');
  });

  it('rejeita datas inexistentes e aceita o formato canônico', () => {
    assert.equal(ehDataCivilValida('2026-02-29'), false);
    assert.equal(ehDataCivilValida('2026-08-31'), true);
  });

  it('cria a data no calendário local', () => {
    const data = criarDataLocal('2026-08-31');
    assert.deepEqual([data.getFullYear(), data.getMonth() + 1, data.getDate()], [2026, 8, 31]);
  });
});
