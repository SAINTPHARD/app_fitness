import axios from 'axios';

// Cria a instância base do Axios apontando para o seu Spring Boot
const api = axios.create({
  baseURL: 'http://localhost:8080'
});

// ==========================================
// 🛡️ INTERCEPTOR DE SEGURANÇA GLOBAL
// ==========================================
// Antes de qualquer requisição sair do React, ele pega o token e anexa no cabeçalho
api.interceptors.request.use(
  (config) => {
    // Busca o token do cofre do navegador
    const token = localStorage.getItem('token'); 

    // Se o usuário estiver logado (tem token), adiciona no header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;