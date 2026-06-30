import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', response.data.email || email);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.data?.mensagens?.join?.(' | ') ||
          `Falha no login. Status HTTP ${error.response.status}.`;

        throw {
          status: error.response.status,
          message,
          data: error.response.data,
        };
      }

      throw {
        status: 0,
        message: 'Não foi possível conectar ao servidor Spring Boot em http://localhost:8080.',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};
