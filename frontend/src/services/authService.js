import api from './api';

/**
 * Serviço responsável pela comunicação de autenticação com o backend Java.
 */
export const authService = {
  
  /**
   * Envia as credenciais do atleta e armazena o token JWT no navegador.
   * @param {string} email 
   * @param {string} senha 
   */
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      // Se o Spring retornar o token com sucesso
      if (response.data && response.data.token) {
        // Armazena o token de forma segura no LocalStorage do navegador
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Captura o JSON de erro do seu GlobalExceptionHandler comercial
      throw error.response ? error.response.data : new Error('Erro ao conectar com o servidor');
    }
  },

  /**
   * Limpa a sessão do atleta.
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Recupera o token ativo para as próximas requisições privadas (Dietas/Treinos).
   */
  getToken: () => {
    return localStorage.getItem('token');
  }

};