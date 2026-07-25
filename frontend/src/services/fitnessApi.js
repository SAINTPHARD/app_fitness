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

  // ==========================================
  // MÓDULO DE DIETA (Integração com Spring Boot)
  // ==========================================
  
  // Busca as refeições de um dia específico passando a data como parâmetro (ex: 2026-07-24)
  buscarRefeicoesDoDia: async (dataIso) => {
    const response = await api.get(`/refeicoes/dia`, { params: { data: dataIso } });
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