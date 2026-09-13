import { fitnessApi } from '../fitnessApi';

export const treinoService = {
  listar: fitnessApi.listarTreinos,
  buscarSessaoDoDia: fitnessApi.buscarSessaoDeHoje,
  obterOuCriarSessaoDoDia: fitnessApi.obterOuCriarSessaoDoDia,
  iniciarSessao: fitnessApi.iniciarSessao,
  pausarSessao: fitnessApi.pausarSessao,
  retomarSessao: fitnessApi.retomarSessao,
  concluirSessao: fitnessApi.concluirSessao,
  buscarResumoSessao: fitnessApi.buscarResumoSessao,
  registrarSerie: fitnessApi.registrarSerie,
  atualizarSerie: fitnessApi.atualizarSerie,
  concluirSerie: fitnessApi.concluirSerie,
  excluirSerie: fitnessApi.excluirSerie,
};
