import { fitnessApi } from '../fitnessApi';
import { exigirDataCivil } from '../../utils/dataCivil';

export const refeicoesService = {
  listarDoDia: (data) => fitnessApi.buscarRefeicoesDoDia(exigirDataCivil(data)),
  criar: (refeicao) => fitnessApi.criarRefeicao({ ...refeicao, data: exigirDataCivil(refeicao.data) }),
  atualizar: (id, refeicao) => fitnessApi.atualizarRefeicao(id, { ...refeicao, data: exigirDataCivil(refeicao.data) }),
  remover: fitnessApi.removerRefeicao,
  adicionarAlimento: fitnessApi.adicionarAlimento,
  atualizarAlimento: fitnessApi.atualizarAlimento,
  removerAlimento: fitnessApi.removerAlimento,
  concluir: fitnessApi.concluirRefeicao,
};
