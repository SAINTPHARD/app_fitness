// Componente Dashboard.jsx: Tela principal do sistema, exibindo indicadores de desempenho e navegação para outras seções.
O "./" significa "procura nesta mesma pasta"
import React, { useEffect, useState } from 'react'; // Importa o React e os hooks useEffect e useState para gerenciar o estado e efeitos colaterais
import api from '../../services/api';  // Importa o serviço de API que criamos para fazer requisições ao backend
import './Dashboard.css'; // Importr o css do dashboard

/**
 * Componente de Dashboard Principal do System Fitness.
 * Contém uma estrutura com barra de navegação lateral (Sidebar) e área de conteúdo.
 */
export default function Dashboard() {
  const [dadosAtleta, setDadosAtleta] = useState({ alunoAtivos: 0, treinoMontados: 0 }); // Estado para armazenar os dados consolidados do painel
  const [erro, setErro] = useState(''); // Estado para armazenar mensagens de erro

  useEffect(() => {
    // Função assíncrona para buscar os dados de indicadores da Dashboard
    const fetchDadosAtleta = async () => {
      try {
        const response = await api.get('/dashboard'); // Faz uma requisição GET para o endpoint protegido /dashboard
        setDadosAtleta(response.data); // Atualiza o estado com os dados numéricos recebidos do Postgres
      } catch (err) {
        // Captura a mensagem de erro tratada pelo GlobalExceptionHandler do backend
        if (err.response && err.response.data && err.response.data.mensagens) {
          setErro(err.response.data.mensagens.join(' | ')); // Atualiza o estado de erro com a mensagem tratada do Java
        } else {
          setErro('Falha ao carregar os dados do dashboard.'); // Mensagem genérica caso a API esteja fora do ar
        }
      }
    };

    fetchDadosAtleta(); // Dispara a função de busca logo na inicialização da tela
  }, []); // O array vazio [] garante que o efeito seja executado apenas uma vez após o componente ser montado  

  /**
   * Remove o Token JWT do localStorage e redireciona para a tela de login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token'); // Destrói o token de acesso guardado no navegador
    window.location.href = '/'; // Redireciona o usuário para a raiz (Login) de forma segura
  };

  return (
    <div className="dashboard-layout">
      
      {/* 🚀 APRIMORAMENTO: Barra Lateral de Navegação (Sidebar) */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <h2>💪 System Fitness</h2>
        </div>
        <nav className="sidebar-menu">
          <a href="/dashboard" className="menu-item active">📊 Painel Geral</a>
          <a href="/alunos" className="menu-item">👥 Gerenciar Alunos</a>
          <a href="/treinos" className="menu-item">🏋️‍♂️ Fichas de Treino</a>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">🚪 Sair do Sistema</button>
        </div>
      </aside>

      {/* Área Central de Conteúdo */}
      <main className="dashboard-content">
        <header className="content-header">
          <h1>Painel de Controle Executivo</h1>
          <p>Bem-vindo ao centro de monitoramento de performance de atletas.</p>
        </header>

        {erro && <div className="error-message">⚠️ {erro}</div>} {/* Exibe a mensagem de erro formatada, se houver */}

        {/* Grade de Cards de Indicadores do Banco de Dados */}
        <div className="dashboard-cards"> 
          
          <div className="dashboard-card card-alunos">
            <div className="card-icon">👥</div>
            <div className="card-info">
              <h2>Alunos Ativos</h2>
              <p className="card-value">{dadosAtleta.alunoAtivos}</p> {/* Exibe dinamicamente o número de alunos ativos */}
            </div>
          </div>

          <div className="dashboard-card card-treinos">
            <div className="card-icon">📝</div>
            <div className="card-info">
              <h2>Treinos Montados</h2>
              <p className="card-value">{dadosAtleta.treinoMontados}</p> {/* Exibe dinamicamente o número de treinos montados */}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}