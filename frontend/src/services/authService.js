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
        message: 'Servidor indisponível. Verifique se o Spring Boot está a correr na porta 8080.',
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
        message: 'Servidor indisponível. Verifique se o Spring Boot está a correr na porta 8080.',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
  },

  getToken: () => localStorage.getItem('token'),
};
