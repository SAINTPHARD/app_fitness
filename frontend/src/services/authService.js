import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      // O backend /auth/login espera o JSON { email, password }
      const response = await api.post('/auth/login', { email, password });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('userEmail', response.data.email || email);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          `Erro no servidor: ${error.response.status}`;

        throw { status: error.response.status, message };
      }

      throw {
        status: 0,
        message: 'Não foi possível conectar ao servidor. Se for o seu primeiro acesso do dia, o sistema pode levar alguns segundos para acordar. Tente novamente.',
      };
    }
  },

  register: async ({ email, password, nome }) => {
    try {
      // O backend de cadastro /usuarios usa a entidade Usuario,
      // que demanda { nome, email, senha }.
      const payload = {
        nome,
        email,
        senha: password,
      };

      const response = await api.post('/usuarios', payload);

      // Guarda o nome já no cadastro: o Header passa a ter o que exibir
      // mesmo antes da primeira resposta de /usuarios/me (cold start).
      if (nome) {
        localStorage.setItem('userName', nome);
      }

      // `profile_complete` é global no localStorage, não por usuário. Sem
      // limpar aqui, uma conta anterior usada no mesmo browser faria o
      // usuário novo pular o onboarding e cair num dashboard sem dados.
      localStorage.removeItem('profile_complete');

      return response.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          `Erro no servidor: ${error.response.status}`;

        throw { status: error.response.status, message };
      }

      throw {
        status: 0,
        message: 'Não foi possível conectar ao servidor. Se for o seu primeiro acesso do dia, o sistema pode levar alguns segundos para acordar. Tente novamente.',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    // Sem isso, o próximo usuário a logar neste browser herdaria o
    // "perfil já concluído" de quem saiu e pularia o onboarding.
    localStorage.removeItem('profile_complete');
  },

  getToken: () => localStorage.getItem('token'),
};
