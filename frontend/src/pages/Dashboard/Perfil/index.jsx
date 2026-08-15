import { useEffect, useState } from 'react';
import { fitnessApi } from '../../../services/fitnessApi';
import { calcularImc, classificarImc, normalizarAlturaCm } from '../../../utils/imc';
import { obterDataDeHojeISO } from '../Dieta/utils/calendario';
import AtualizacaoPesoCard from '../AtualizacaoPesoCard';
import './perfil.css';

const OBJETIVOS = [
  { valor: 'EMAGRECER', label: 'Perder peso' },
  { valor: 'MANTER', label: 'Manter peso' },
  { valor: 'HIPERTROFIA', label: 'Ganhar massa' },
];

const CHAVE_HISTORICO_PESO = 'home-historico-peso';
const MAXIMO_PONTOS_HISTORICO = 30;

function rotuloObjetivo(valor) {
  return OBJETIVOS.find((item) => item.valor === valor)?.label || valor || '---';
}

async function registrarPesoNoHistorico(peso) {
  const pesoNumero = Number(peso);
  if (!pesoNumero || pesoNumero <= 0) return;

  const hojeISO = obterDataDeHojeISO();

  try {
    await fitnessApi.criarPeso({ data: hojeISO, peso: pesoNumero });
    return;
  } catch (erroBackend) {
    console.error('Falha ao registrar peso no backend:', erroBackend);
  }

  if (typeof window === 'undefined') return;

  try {
    const salvo = window.localStorage.getItem(CHAVE_HISTORICO_PESO);
    const historico = salvo ? JSON.parse(salvo) : [];
    const atualizado = [...historico.filter((ponto) => ponto.data !== hojeISO), { data: hojeISO, peso: pesoNumero }].slice(
      -MAXIMO_PONTOS_HISTORICO
    );
    window.localStorage.setItem(CHAVE_HISTORICO_PESO, JSON.stringify(atualizado));
  } catch {
    // storage indisponível — ignora
  }
}

const FORMULARIO_VAZIO = { nome: '', peso: '', altura: '', objetivo: 'MANTER' };

export default function PerfilPage() {
  const [profile, setProfile] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const carregarPerfil = async () => {
    try {
      const response = await fitnessApi.getProfile();
      let dados = response.data || {};

      // CORREÇÃO (mesma migração de `usePerfilResumo`): se a altura salva
      // ainda está em metros, corrige para cm antes de exibir no formulário
      // e persiste a correção no backend — a página de Perfil é onde o
      // usuário mais provavelmente vai notar "Altura: 1.8 cm" errado, então
      // vale ter a mesma blindagem aqui mesmo com o hook compartilhado já
      // cobrindo Home/Dieta/Evolução.
      const alturaNormalizada = normalizarAlturaCm(dados.altura);
      if (alturaNormalizada !== null && alturaNormalizada !== Number(dados.altura)) {
        dados = { ...dados, altura: alturaNormalizada };
        fitnessApi
          .updateProfile({ ...dados, altura: alturaNormalizada })
          .catch((erroMigracao) => console.error('Falha ao migrar altura salva em metros para cm:', erroMigracao));
      }

      setProfile(dados);
      setFormulario({
        nome: dados.nome || '',
        peso: dados.peso ?? '',
        altura: dados.altura ?? '',
        objetivo: dados.objetivo || 'MANTER',
      });
    } catch (error) {
      console.error(error);
      setErro('Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  const imc = calcularImc(profile?.peso, profile?.altura);
  const classificacao = classificarImc(imc);

  const atualizarCampo = (campo, valor) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  };

  const salvarPerfil = async (evento) => {
    evento.preventDefault();
    setErro('');
    setMensagem('');

    const pesoNumero = Number(formulario.peso);
    const alturaNumero = Number(formulario.altura);

    if (pesoNumero < 20 || pesoNumero > 300) {
      setErro('Peso deve estar entre 20 e 300 kg.');
      return;
    }

    if (alturaNumero < 50 || alturaNumero > 250) {
      setErro('Altura deve estar entre 50 e 250 cm (dica: 1,82m = 182cm).');
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        ...profile,
        nome: formulario.nome.trim() || profile?.nome,
        peso: Number(formulario.peso) || 0,
        altura: Number(formulario.altura) || 0,
        objetivo: formulario.objetivo,
      };

      const resposta = await fitnessApi.updateProfile(payload);
      const atualizado = resposta.data || payload;
      setProfile(atualizado);
      await registrarPesoNoHistorico(atualizado.peso);
      setMensagem('Perfil atualizado com sucesso.');
    } catch (err) {
      setErro(err?.response?.data?.message || err?.message || 'Falha ao salvar o perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const aoAtualizarPeso = async (perfilAtualizado) => {
    const payload = {
      ...profile,
      ...perfilAtualizado,
      peso: Number(perfilAtualizado.peso),
    };
    const resposta = await fitnessApi.updateProfile(payload);
    const atualizado = resposta.data || payload;
    setProfile(atualizado);
    setFormulario((prev) => ({ ...prev, peso: atualizado.peso ?? prev.peso }));
    await registrarPesoNoHistorico(atualizado.peso);
  };

  if (loading) {
    return (
      <section className="perfilPage">
        <p className="perfilMuted">Carregando seus dados...</p>
      </section>
    );
  }

  return (
    <section className="perfilPage">
      <div className="perfilCabecalho">
        <p className="perfilEyebrow">Perfil</p>
        <h2 className="perfilTitulo">Seus dados</h2>
        <p className="perfilSubtitulo">Edite informações básicas e registre o peso do dia.</p>
      </div>

      <div className="perfilStatsGrid">
        <article>
          <span>Peso</span>
          <strong>{profile?.peso ? `${profile.peso} kg` : '---'}</strong>
        </article>
        <article>
          <span>Altura</span>
          <strong>{profile?.altura ? `${profile.altura} cm` : '---'}</strong>
        </article>
        <article>
          <span>IMC</span>
          <strong>{imc ?? '---'}</strong>
          {classificacao && <em>{classificacao}</em>}
        </article>
        <article>
          <span>Objetivo</span>
          <strong>{rotuloObjetivo(profile?.objetivo)}</strong>
        </article>
      </div>

      <div className="perfilGrade">
        <form className="perfilCard" onSubmit={salvarPerfil}>
          <h3>Editar perfil</h3>

          <label className="perfilCampo">
            Nome
            <input
              type="text"
              value={formulario.nome}
              onChange={(e) => atualizarCampo('nome', e.target.value)}
              required
            />
          </label>

          <div className="perfilLinha">
            <label className="perfilCampo">
              Peso (kg)
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={formulario.peso}
                onChange={(e) => atualizarCampo('peso', e.target.value)}
                required
              />
            </label>
            <label className="perfilCampo">
              Altura (cm)
              <input
                type="number"
                step="1"
                min="50"
                max="250"
                placeholder="Ex: 182"
                value={formulario.altura}
                onChange={(e) => atualizarCampo('altura', e.target.value)}
                required
              />
            </label>
          </div>

          <label className="perfilCampo">
            Objetivo
            <select value={formulario.objetivo} onChange={(e) => atualizarCampo('objetivo', e.target.value)}>
              {OBJETIVOS.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {erro && <p className="perfilErro">{erro}</p>}
          {mensagem && <p className="perfilSucesso">{mensagem}</p>}

          <button type="submit" className="perfilBotao" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        <AtualizacaoPesoCard perfilAtual={profile} aoAtualizarPerfil={aoAtualizarPeso} />
      </div>
    </section>
  );
}
