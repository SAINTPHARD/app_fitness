import { fitnessApi } from '../fitnessApi';
import { validarMetas } from './regrasDominio';
export { LIMITES_METAS, validarMetas } from './regrasDominio';

export const metasService = {
  buscar: fitnessApi.getMetas,
  atualizar: (metas) => fitnessApi.updateMetas(validarMetas(metas)),
};
