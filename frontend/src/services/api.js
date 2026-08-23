import axios from 'axios';
import { notificarErro, notificarInfo } from '../utils/notificacoes';
import { extrairMensagemErro } from '../utils/erroApi';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    'VITE_API_URL não configurada. Defina a URL do backend no ambiente do frontend e reinicie o Vite.'
  );
}

if (import.meta.env.PROD && API_URL && /localhost|127\.0\.0\.1/.test(API_URL)) {
  throw new Error('VITE_API_URL de produção não pode apontar para localhost.');
}

// Hospedagens gratuitas suspendem o container quando ele fica ocioso; a
// primeira requisição depois disso ("cold start") pode levar bem mais que
// os 15s antigos, e o timeout transformava a espera em erro de rede.
const TIMEOUT_PADRAO_MS = 45000;
// Depois desse tempo sem resposta assumimos que o backend está acordando e
// avisamos o usuário — uma vez por sessão, para não virar spam de toast.
const LIMIAR_AVISO_COLD_START_MS = 4000;

const api = axios.create({
  baseURL: API_URL || '',
  timeout: TIMEOUT_PADRAO_MS,
});

let requisicoesEmAndamento = 0;
let avisoColdStartExibido = false;
let temporizadorColdStart = null;

function cancelarTemporizadorColdStart() {
  if (temporizadorColdStart) {
    clearTimeout(temporizadorColdStart);
    temporizadorColdStart = null;
  }
}

function registrarInicioRequisicao() {
  requisicoesEmAndamento += 1;

  if (avisoColdStartExibido || temporizadorColdStart) return;

  temporizadorColdStart = setTimeout(() => {
    temporizadorColdStart = null;
    if (requisicoesEmAndamento > 0 && !avisoColdStartExibido) {
      avisoColdStartExibido = true;
      notificarInfo('O servidor está acordando. O primeiro carregamento pode levar alguns segundos.');
    }
  }, LIMIAR_AVISO_COLD_START_MS);
}

function registrarFimRequisicao() {
  requisicoesEmAndamento = Math.max(0, requisicoesEmAndamento - 1);
  if (requisicoesEmAndamento === 0) {
    cancelarTemporizadorColdStart();
  }
}

let refreshEmAndamento = false;
let logoutPorSessaoExpiradaNotificado = false;
let filaRefresh = [];

function resolverFilaRefresh(error, token = null) {
  filaRefresh.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token);
  });

  filaRefresh = [];
}

function limparSessaoExpirada() {
  localStorage.clear();

  if (!logoutPorSessaoExpiradaNotificado) {
    logoutPorSessaoExpiradaNotificado = true;
    notificarErro('Sessão expirada. Faça login novamente.');
  }

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function renovarToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('Refresh token ausente.');
  }

  const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
  const novoToken = response.data?.token;
  const novoRefreshToken = response.data?.refreshToken || refreshToken;

  if (!novoToken) {
    throw new Error('Resposta de refresh sem token.');
  }

  localStorage.setItem('token', novoToken);
  localStorage.setItem('refreshToken', novoRefreshToken);

  if (response.data?.email) {
    localStorage.setItem('userEmail', response.data.email);
  }

  return novoToken;
}

// ==========================================
// 🛡️ INTERCEPTOR DE REQUEST (Adiciona o Token)
// ==========================================
api.interceptors.request.use(
  (config) => {
    registrarInicioRequisicao();

    const token = localStorage.getItem('token');
    
    // Garante que o objeto headers existe antes de injetar o token
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    registrarFimRequisicao();
    return Promise.reject(error);
  }
);

// ==========================================
// 🛡️ INTERCEPTOR DE RESPONSE (Tratamento de Erros e 401)
// ==========================================
api.interceptors.response.use(
  (response) => {
    registrarFimRequisicao();
    return response;
  },
  async (error) => {
    registrarFimRequisicao();
    const requisicaoOriginal = error.config;
    const urlOriginal = requisicaoOriginal?.url || '';
    const rotaAutenticacao = urlOriginal.includes('/auth/login') || urlOriginal.includes('/auth/refresh');

    // 🚨 1. Deteta Token Expirado ou Inválido (Erro 401)
    if (error.response?.status === 401 && requisicaoOriginal && !requisicaoOriginal._retry && !rotaAutenticacao) {
      requisicaoOriginal._retry = true;

      if (refreshEmAndamento) {
        return new Promise((resolve, reject) => {
          filaRefresh.push({ resolve, reject });
        }).then((novoToken) => {
          requisicaoOriginal.headers = requisicaoOriginal.headers || {};
          requisicaoOriginal.headers.Authorization = `Bearer ${novoToken}`;
          return api(requisicaoOriginal);
        }).catch((refreshError) => Promise.reject(refreshError));
      }

      refreshEmAndamento = true;

      try {
        const novoToken = await renovarToken();
        resolverFilaRefresh(null, novoToken);

        requisicaoOriginal.headers = requisicaoOriginal.headers || {};
        requisicaoOriginal.headers.Authorization = `Bearer ${novoToken}`;

        return api(requisicaoOriginal);
      } catch (refreshError) {
        resolverFilaRefresh(refreshError, null);
        limparSessaoExpirada();
        return new Promise(() => {});
      } finally {
        refreshEmAndamento = false;
      }
    }

    // 🚨 2. Tratamento padrão para os outros erros (500, 404, 400...)
    if (!error?.config?.silenciarErroGlobal) {
      notificarErro(extrairMensagemErro(error));
    }
    
    return Promise.reject(error);
  }
);

// ==========================================
// 🛡️ DEDUPLICAÇÃO DE REQUISIÇÕES GET EM VOO
// ==========================================
const requisicoesEmVoo = new Map();

function chaveRequisicao(url, params) {
  return `${url}:${params ? JSON.stringify(params) : ''}`;
}

const getOriginal = api.get.bind(api);
api.get = (url, config = {}) => {
  const chave = chaveRequisicao(url, config.params);
  const existente = requisicoesEmVoo.get(chave);
  
  if (existente) return existente;

  const promessa = getOriginal(url, config).finally(() => {
    requisicoesEmVoo.delete(chave);
  });
  
  requisicoesEmVoo.set(chave, promessa);
  return promessa;
};

// --- INTEGRAÇÃO COM CATÁLOGO EXTERNO ---

export const buscarCatalogoExercicios = async (musculoAlvo) => {
  try {
    // Aponta para o SEU Spring Boot, que fará a ponte segura com a RapidAPI
    const response = await api.get(`/catalogo-exercicios/musculo/${musculoAlvo}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar catálogo para o músculo ${musculoAlvo}:`, error);
    throw error;
  }
};

export default api;
