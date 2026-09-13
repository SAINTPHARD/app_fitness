import { fitnessApi } from '../fitnessApi';
import { normalizarRegistroPeso } from './regrasDominio';
export { LIMITES_PESO_KG, normalizarRegistroPeso } from './regrasDominio';

export const pesoService = {
  listar: fitnessApi.listarPesos,
  criar: (registro) => fitnessApi.criarPeso(normalizarRegistroPeso(registro)),
  atualizar: (id, registro) => fitnessApi.atualizarPeso(id, normalizarRegistroPeso(registro)),
  remover: fitnessApi.removerPeso,
};
