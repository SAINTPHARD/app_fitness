import { fitnessApi } from '../fitnessApi';
import { exigirDataCivil } from '../../utils/dataCivil';
import { validarQuantidadeAgua } from './regrasDominio';
export { LIMITES_HIDRATACAO, validarQuantidadeAgua } from './regrasDominio';

export const hidratacaoService = {
  listarDoDia: (data) => fitnessApi.listarAguaDoDia(exigirDataCivil(data)),
  registrar: ({ data, quantidadeMl, origem = 'manual' }) =>
    fitnessApi.criarRegistroAgua({
      diaReferencia: exigirDataCivil(data, 'dia de referência'),
      quantidadeMl: validarQuantidadeAgua(quantidadeMl),
      origem,
    }),
  remover: fitnessApi.removerRegistroAgua,
};
