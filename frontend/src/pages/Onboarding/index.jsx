import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // <-- IMPORTAMOS O AXIOS DIRETAMENTE
import './onboarding.css';

const TOTAL_ETAPAS = 4;

// O backend só reconhece estes 3 objetivos (enum `Objetivo` do Spring) — em
// vez de simular uma seleção múltipla de 5 opções que não teria como ser
// persistida, o formulário já nasce alinhado ao que a API aceita de verdade.
const OBJETIVOS = [
  { valor: 'EMAGRECER', titulo: 'Perder peso', descricao: 'Déficit calórico controlado' },
  { valor: 'MANTER', titulo: 'Manter peso', descricao: 'Equilíbrio entre consumo e gasto' },
  { valor: 'HIPERTROFIA', titulo: 'Ganhar massa', descricao: 'Superávit calórico e treino de força' },
];

// Nível de atividade ainda não existe como campo no backend — guardamos como
// preferência local (mesma estratégia já usada para metas de água/macros na
// Dieta) até o backend ganhar esse campo.
const NIVEIS_ATIVIDADE = [
  { valor: 'SEDENTARIO', titulo: 'Não muito ativo', descricao: 'Pouco ou nenhum exercício' },
  { valor: 'LEVE', titulo: 'Levemente ativo', descricao: 'Exercício leve 1-3x por semana' },
  { valor: 'ATIVO', titulo: 'Ativo', descricao: 'Exercício moderado 3-5x por semana' },
  { valor: 'MUITO_ATIVO', titulo: 'Muito ativo', descricao: 'Exercício intenso quase todos os dias' },
];

const DADOS_INICIAIS = {
  objetivo: '',
  nivelAtividade: '',
  sexo: '',
  dataNascimento: '',
  pais: '',
  altura: '',
  peso: '',
  pesoAlvo: '',
};

/** Calcula a idade (anos completos) a partir da data de nascimento. */
function calcularIdade(dataNascimentoISO) {
  if (!dataNascimentoISO) return null;

  const nascimento = new Date(dataNascimentoISO);
  if (Number.isNaN(nascimento.getTime())) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversarioEsteAno =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversarioEsteAno) idade -= 1;
  return idade >= 0 ? idade : null;
}

export default function OnboardingPage() {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const atualizarCampo = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  const etapaValida = () => {
    if (etapa === 1) return Boolean(dados.objetivo);
    if (etapa === 2) return Boolean(dados.nivelAtividade);
    if (etapa === 3) return Boolean(dados.sexo) && Boolean(dados.dataNascimento);
    if (etapa === 4) {
      const altura = Number(dados.altura);
      const peso = Number(dados.peso);
      // Faixas plausíveis (50-250cm, 20-300kg) — sem isso, alguém digitando
      // "1.82" (pensando em metros) num campo de cm passava validação e
      // gerava um IMC absurdo mais adiante (ex: 240740.7).
      return altura >= 50 && altura <= 250 && peso >= 20 && peso <= 300;
    }
    return true;
  };

  const avancar = () => {
    if (!etapaValida()) {
      setError('Preencha os campos desta etapa antes de continuar.');
      return;
    }
    setError('');
    setEtapa((prev) => Math.min(prev + 1, TOTAL_ETAPAS));
  };

  const voltar = () => {
    setError('');
    setEtapa((prev) => Math.max(prev - 1, 1));
  };

  const finalizar = async (evento) => {
    evento.preventDefault();

    if (!etapaValida()) {
      setError('Altura deve estar entre 50 e 250cm e peso entre 20 e 300kg (dica: 1,82m = 182cm).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. CAPTURA O TOKEN SALVO NO LOGIN (A SOLUÇÃO DIRETA)
      const token = localStorage.getItem('token');
      
      // 2. CONFIGURA O CABEÇALHO COM O "CRACHÁ" DE SEGURANÇA
      const configSeguranca = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // 3. FAZ AS REQUISIÇÕES DIRETAMENTE COM O AXIOS (Passando o configSeguranca)
      // Substituímos o 'fitnessApi.getProfile()' para garantir o envio do token
      const respostaPerfil = await axios.get('http://localhost:8080/usuarios/me', configSeguranca);
      const perfilAtual = respostaPerfil.data;

      const payload = {
        ...perfilAtual, // Spread direto nos dados recebidos
        peso: Number(dados.peso) || 0,
        altura: Number(dados.altura) || 0,
        idade: calcularIdade(dados.dataNascimento) ?? perfilAtual?.idade ?? null,
        objetivo: dados.objetivo,
        sexo: dados.sexo || perfilAtual?.sexo || null,
      };

      // 4. ATUALIZA AS MÉTRICAS COM O TOKEN (Substituímos o 'fitnessApi.updateMetrics()')
      await axios.put('http://localhost:8080/usuarios/me/metricas', payload, configSeguranca);

      // Preferências que o backend ainda não tem coluna para guardar.
      window.localStorage.setItem(
        'perfil-preferencias-locais',
        JSON.stringify({
          nivelAtividade: dados.nivelAtividade,
          pais: dados.pais,
          pesoAlvo: Number(dados.pesoAlvo) || null,
        })
      );

      localStorage.setItem('profile_complete', 'true');
      
      // 5. REDIRECIONAMENTO COM SUCESSO!
      navigate('/dashboard/inicio');
      
    } catch (err) {
      const mensagem =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Não foi possível salvar seus dados. Tente novamente.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <p className="eyebrow">Passo {etapa} de {TOTAL_ETAPAS}</p>
        <div className="progresso">
          {Array.from({ length: TOTAL_ETAPAS }).map((_, indice) => (
            <span
              key={indice}
              className={`progressoPasso ${indice < etapa ? 'progressoPassoAtivo' : ''}`}
            />
          ))}
        </div>

        {etapa === 1 && (
          <>
            <h1 className="title">Qual é o seu objetivo?</h1>
            <p className="subtitle">Isso ajusta suas metas de calorias e macros na Dieta.</p>
            <div className="gradeOpcoes">
              {OBJETIVOS.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => atualizarCampo('objetivo', opcao.valor)}
                  className={`opcaoCartao ${dados.objetivo === opcao.valor ? 'opcaoCartaoAtiva' : ''}`}
                >
                  <span className="opcaoCartaoTitulo">{opcao.titulo}</span>
                  <span className="opcaoCartaoDescricao">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {etapa === 2 && (
          <>
            <h1 className="title">Qual seu nível de atividade?</h1>
            <p className="subtitle">Usamos isso para estimar melhor seu gasto calórico diário.</p>
            <div className="gradeOpcoes">
              {NIVEIS_ATIVIDADE.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => atualizarCampo('nivelAtividade', opcao.valor)}
                  className={`opcaoCartao ${dados.nivelAtividade === opcao.valor ? 'opcaoCartaoAtiva' : ''}`}
                >
                  <span className="opcaoCartaoTitulo">{opcao.titulo}</span>
                  <span className="opcaoCartaoDescricao">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {etapa === 3 && (
          <>
            <h1 className="title">Seus dados pessoais</h1>
            <p className="subtitle">O sexo biológico ajuda a calcular sua necessidade calórica com mais precisão.</p>
            <div className="form">
              <div className="gradeOpcoes">
                <button
                  type="button"
                  onClick={() => atualizarCampo('sexo', 'M')}
                  className={`opcaoCartao ${dados.sexo === 'M' ? 'opcaoCartaoAtiva' : ''}`}
                >
                  <span className="opcaoCartaoTitulo">Masculino</span>
                </button>
                <button
                  type="button"
                  onClick={() => atualizarCampo('sexo', 'F')}
                  className={`opcaoCartao ${dados.sexo === 'F' ? 'opcaoCartaoAtiva' : ''}`}
                >
                  <span className="opcaoCartaoTitulo">Feminino</span>
                </button>
              </div>

              <label className="field">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  value={dados.dataNascimento}
                  onChange={(e) => atualizarCampo('dataNascimento', e.target.value)}
                  className="input"
                />
              </label>

              <label className="field">
                <span>País</span>
                <input
                  type="text"
                  placeholder="Brasil"
                  value={dados.pais}
                  onChange={(e) => atualizarCampo('pais', e.target.value)}
                  className="input"
                />
              </label>
            </div>
          </>
        )}

        {etapa === 4 && (
          <>
            <h1 className="title">Métricas corporais</h1>
            <p className="subtitle">Sua altura, peso atual e a meta de peso que você quer alcançar.</p>
            <div className="form">
              <label className="field">
                <span>Altura (cm)</span>
                <input
                  type="number"
                  min="50"
                  max="250"
                  step="1"
                  placeholder="Ex: 182"
                  value={dados.altura}
                  onChange={(e) => atualizarCampo('altura', e.target.value)}
                  className="input"
                />
              </label>
              <label className="field">
                <span>Peso atual (kg)</span>
                <input
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={dados.peso}
                  onChange={(e) => atualizarCampo('peso', e.target.value)}
                  className="input"
                />
              </label>
              <label className="field">
                <span>Peso alvo (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={dados.pesoAlvo}
                  onChange={(e) => atualizarCampo('pesoAlvo', e.target.value)}
                  className="input"
                />
              </label>
            </div>
          </>
        )}

        {error && <div className="error">{error}</div>}

        <div className="linhaBotoes">
          {etapa > 1 && (
            <button type="button" className="botaoVoltar" onClick={voltar} disabled={loading}>
              Voltar
            </button>
          )}
          {etapa < TOTAL_ETAPAS ? (
            <button type="button" className="submit" onClick={avancar}>
              Avançar
            </button>
          ) : (
            <button type="button" className="submit" onClick={finalizar} disabled={loading}>
              {loading ? 'Salvando...' : 'Concluir'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}