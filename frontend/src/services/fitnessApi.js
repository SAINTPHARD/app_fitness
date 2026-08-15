import api from './api';

function extrairValorSelecionado(valor) {
  if (valor && typeof valor === 'object') {
    return valor.value ?? valor.label ?? '';
  }

  return valor ?? '';
}

function normalizarString(valor) {
  return String(extrairValorSelecionado(valor)).trim();
}

function normalizarNumero(valor) {
  const numero = Number(extrairValorSelecionado(valor));
  return Number.isFinite(numero) ? numero : 0;
}

function normalizarRefeicao(refeicao) {
  return {
    ...refeicao,
    nome: normalizarString(refeicao?.nome),
    horario: normalizarString(refeicao?.horario),
    data: normalizarString(refeicao?.data),
  };
}

function normalizarAlimento(alimento) {
  return {
    ...alimento,
    nome: normalizarString(alimento?.nome),
    quantidade: normalizarString(alimento?.quantidade),
    calorias: normalizarNumero(alimento?.calorias),
    proteina: normalizarNumero(alimento?.proteina),
    carboidratos: normalizarNumero(alimento?.carboidratos),
    gordura: normalizarNumero(alimento?.gordura),
  };
}

// O backend não tem um recurso "/profile" — o perfil do usuário autenticado
// vive em `/usuarios/me` (resolvido a partir do token JWT, sem precisar o
// front-end saber o ID numérico). Ver `UsuarioController.buscarUsuarioAutenticado`
// e `atualizarUsuarioAutenticado` no Spring Boot.
export const fitnessApi = {
  
  // ==========================================
  // PERFIL DO USUÁRIO
  // ==========================================
  getProfile: () => api.get('/usuarios/me'),
  updateProfile: (profile) => api.put('/usuarios/me', profile),
  // Endpoint dedicado para o fluxo de Onboarding/métricas corporais
  // (PUT /usuarios/me/metricas) — mesmo contrato de dados de `updateProfile`,
  // mas semanticamente mais claro sobre o que está sendo atualizado.
  updateMetrics: (metricas) => api.put('/usuarios/me/metricas', metricas),
  getMetas: async () => {
    const response = await api.get('/usuarios/me/metas');
    return response.data;
  },
  updateMetas: async (metas) => {
    const response = await api.put('/usuarios/me/metas', metas);
    return response.data;
  },

  // ==========================================
  // MÓDULO DE DIETA (Integração com Spring Boot)
  // ==========================================
  
  // Busca as refeições de um dia específico passando a data como parâmetro (ex: 2026-07-24)
  buscarRefeicoesDoDia: async (dataIso) => {
    const response = await api.get(`/refeicoes/dia`, { params: { data: dataIso } });
    return response.data;
  },

  // Cria uma refeição de verdade no backend (POST). Necessário antes de
  // adicionar qualquer alimento a uma refeição que ainda só existe como
  // rascunho local no React (as 3 refeições padrão do dia vazio, ou uma
  // "Nova refeição" recém-nomeada pelo usuário) — ver `useRefeicoes.js`.
  // Não é preciso enviar o usuário: o backend identifica quem é dono da
  // refeição a partir do token JWT (ver RefeicaoController.criar).
  criarRefeicao: async (refeicao) => {
    const response = await api.post(`/refeicoes`, normalizarRefeicao(refeicao));
    return response.data;
  },

  atualizarRefeicao: async (idRefeicao, refeicao) => {
    const response = await api.put(`/refeicoes/${idRefeicao}`, normalizarRefeicao(refeicao));
    return response.data;
  },

  // Adiciona um alimento a uma refeição existente — inclusive já concluída.
  // (POST). Retorna a REFEIÇÃO inteira (itens + totalCalorias recalculado),
  // não só o alimento criado — ver RefeicaoService.adicionarAlimento.
  adicionarAlimento: async (idRefeicao, alimento) => {
    const response = await api.post(`/refeicoes/${idRefeicao}/alimentos`, normalizarAlimento(alimento));
    return response.data;
  },

  // Atualiza os dados de um alimento (ex: mudou de 100g para 150g) (PUT)
  atualizarAlimento: async (idRefeicao, idAlimento, alimentoAtualizado) => {
    const response = await api.put(
      `/refeicoes/${idRefeicao}/alimentos/${idAlimento}`,
      normalizarAlimento(alimentoAtualizado)
    );
    return response.data;
  },

  // Remove um alimento da refeição (DELETE)
  removerAlimento: async (idRefeicao, idAlimento) => {
    const response = await api.delete(`/refeicoes/${idRefeicao}/alimentos/${idAlimento}`);
    return response.data;
  },

  // Marca uma refeição como concluída (PATCH — altera só o status, não a
  // refeição inteira). Ver RefeicaoController.concluirRefeicao no Spring Boot.
  concluirRefeicao: async (idRefeicao) => {
    const response = await api.patch(`/refeicoes/${idRefeicao}/concluir`);
    return response.data;
  },

  // Remove uma refeição inteira (e seus alimentos, via cascade no backend).
  // Ver RefeicaoController.deletar / RefeicaoService.deletar.
  removerRefeicao: async (idRefeicao) => {
    await api.delete(`/refeicoes/${idRefeicao}`);
  },

  // ==========================================
  // MÓDULO DE EVOLUÇÃO
  // ==========================================

  listarPesos: async () => {
    const response = await api.get('/evolucao/pesos');
    return response.data || [];
  },

  criarPeso: async (registro) => {
    const response = await api.post('/evolucao/pesos', registro);
    return response.data;
  },

  atualizarPeso: async (id, registro) => {
    const response = await api.put(`/evolucao/pesos/${id}`, registro);
    return response.data;
  },

  removerPeso: async (id) => {
    await api.delete(`/evolucao/pesos/${id}`);
  },

  listarMedidas: async () => {
    const response = await api.get('/evolucao/medidas');
    return response.data || [];
  },

  criarMedida: async (registro) => {
    const response = await api.post('/evolucao/medidas', registro);
    return response.data;
  },

  atualizarMedida: async (id, registro) => {
    const response = await api.put(`/evolucao/medidas/${id}`, registro);
    return response.data;
  },

  removerMedida: async (id) => {
    await api.delete(`/evolucao/medidas/${id}`);
  },

  listarFotos: async () => {
    const response = await api.get('/evolucao/fotos');
    return response.data || [];
  },

  criarFoto: async (foto) => {
    const response = await api.post('/evolucao/fotos', foto);
    return response.data;
  },

  atualizarFoto: async (id, foto) => {
    const response = await api.put(`/evolucao/fotos/${id}`, foto);
    return response.data;
  },

  removerFoto: async (id) => {
    await api.delete(`/evolucao/fotos/${id}`);
  },

  // ==========================================
  // MÓDULO DE HIDRATAÇÃO
  // ==========================================

  listarAguaDoDia: async (dataIso) => {
    const response = await api.get('/agua', { params: { data: dataIso } });
    return response.data || [];
  },

  criarRegistroAgua: async (registro) => {
    const response = await api.post('/agua', registro);
    return response.data;
  },

  atualizarRegistroAgua: async (id, registro) => {
    const response = await api.put(`/agua/${id}`, registro);
    return response.data;
  },

  removerRegistroAgua: async (id) => {
    await api.delete(`/agua/${id}`);
  },

  // ==========================================
  // MÓDULO DE TREINO (fichas, exercícios, sessões e séries)
  // ==========================================

  // Lista todas as fichas (uma por dia da semana) do usuário autenticado.
  listarTreinos: async () => {
    const response = await api.get('/treinos');
    return response.data;
  },

  // Busca a ficha de um dia específico. `null` quando o usuário ainda não
  // tem nenhuma ficha criada para aquele dia (204 No Content do backend).
  buscarTreinoPorDia: async (diaSemana) => {
    const response = await api.get('/treinos/dia', { params: { diaSemana } });
    return response.status === 204 ? null : response.data;
  },

  criarTreino: async (treino) => {
    const response = await api.post('/treinos', treino);
    return response.data;
  },

  // Adiciona um exercício a uma ficha — 409 (já tratado pelo toast global)
  // se o mesmo nome já estiver na ficha.
  adicionarExercicioTreino: async (treinoId, exercicio) => {
    const response = await api.post(`/treinos/${treinoId}/exercicios`, exercicio);
    return response.data;
  },

  atualizarExercicioTreino: async (idExercicio, exercicio) => {
    const response = await api.put(`/exercicios/${idExercicio}`, exercicio);
    return response.data;
  },

  removerExercicioTreino: async (idExercicio) => {
    await api.delete(`/exercicios/${idExercicio}`);
  },

  // Última execução concluída do exercício (para o preenchimento
  // inteligente) — todos os campos vêm `null` quando não há histórico.
  buscarUltimaExecucaoExercicio: async (idExercicio) => {
    const response = await api.get(`/exercicios/${idExercicio}/ultima-execucao`);
    return response.data;
  },

  // Espia a sessão de hoje de uma ficha SEM criar (204 se não existir) —
  // uso em telas de leitura como o widget "Próximo treino" da Home.
  buscarSessaoDeHoje: async (treinoId) => {
    const response = await api.get(`/treinos/${treinoId}/sessoes/hoje`);
    return response.status === 204 ? null : response.data;
  },

  // Abre (ou retoma, se já existir) a sessão de execução de hoje de uma
  // ficha — idempotente, seguro de chamar sempre que o usuário abre o dia.
  obterOuCriarSessaoDoDia: async (treinoId) => {
    const response = await api.post(`/treinos/${treinoId}/sessoes`);
    return response.data;
  },

  iniciarSessao: async (idSessao) => (await api.patch(`/sessoes/${idSessao}/iniciar`)).data,
  pausarSessao: async (idSessao) => (await api.patch(`/sessoes/${idSessao}/pausar`)).data,
  retomarSessao: async (idSessao) => (await api.patch(`/sessoes/${idSessao}/retomar`)).data,
  concluirSessao: async (idSessao) => (await api.patch(`/sessoes/${idSessao}/concluir`)).data,

  // Resumo final: tempo total, volume, recordes, pendências — pode ser
  // consultado mesmo antes de concluir (para o "tem certeza?" na UI).
  buscarResumoSessao: async (idSessao) => (await api.get(`/sessoes/${idSessao}/resumo`)).data,

  registrarSerie: async (idSessao, serie) => {
    const response = await api.post(`/sessoes/${idSessao}/series`, serie);
    return response.data;
  },

  atualizarSerie: async (idSerie, serie) => {
    const response = await api.put(`/series/${idSerie}`, serie);
    return response.data;
  },

  concluirSerie: async (idSerie) => {
    const response = await api.patch(`/series/${idSerie}/concluir`);
    return response.data;
  },

  // `confirmar: true` obrigatório para excluir uma série já concluída —
  // sem isso o backend responde 409 (ver SerieService.excluir).
  excluirSerie: async (idSerie, confirmar = false) => {
    await api.delete(`/series/${idSerie}`, { params: { confirmar } });
  },
};
