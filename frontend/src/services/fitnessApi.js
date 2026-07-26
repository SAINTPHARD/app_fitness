import api from './api';

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
    const response = await api.post(`/refeicoes`, refeicao);
    return response.data;
  },

  // Adiciona um alimento a uma refeição existente (POST)
  adicionarAlimento: async (idRefeicao, alimento) => {
    const response = await api.post(`/refeicoes/${idRefeicao}/alimentos`, alimento);
    return response.data;
  },

  // Atualiza os dados de um alimento (ex: mudou de 100g para 150g) (PUT)
  atualizarAlimento: async (idRefeicao, idAlimento, alimentoAtualizado) => {
    const response = await api.put(`/refeicoes/${idRefeicao}/alimentos/${idAlimento}`, alimentoAtualizado);
    return response.data;
  },

  // Remove um alimento da refeição (DELETE)
  removerAlimento: async (idRefeicao, idAlimento) => {
    await api.delete(`/refeicoes/${idRefeicao}/alimentos/${idAlimento}`);
  }
};