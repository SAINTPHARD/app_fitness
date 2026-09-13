import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mensagemErroAutenticacao } from './authErrors.js';

describe('mensagemErroAutenticacao', () => {
  test('não expõe detalhes para credenciais inválidas', () => {
    assert.equal(mensagemErroAutenticacao({ status: 401, message: 'usuário ausente' }), 'E-mail ou senha inválidos.');
  });

  test('distingue indisponibilidade temporária de erro de validação', () => {
    assert.match(mensagemErroAutenticacao({ status: 503 }), /temporariamente indisponível/);
    assert.equal(mensagemErroAutenticacao({ status: 400, message: 'E-mail inválido.' }), 'E-mail inválido.');
  });
});
