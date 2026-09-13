import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, LockKeyhole, ShieldCheck } from 'lucide-react';
import { fitnessApi } from '../../../services/fitnessApi';
import { calcularImc, classificarImc, normalizarAlturaCm, tonalidadeImc } from '../../../utils/imc';
import { obterUltimoRegistroPeso } from '../../../utils/historicoPeso';
import './perfil.css';

const OBJETIVOS = [
  { valor: 'EMAGRECER', label: 'Perder peso' }, { valor: 'MANTER', label: 'Manter peso' },
  { valor: 'HIPERTROFIA', label: 'Ganhar massa' },
];

export default function PerfilPage() {
  const [perfil, setPerfil] = useState(null);
  const [formulario, setFormulario] = useState({ nome: '', altura: '', objetivo: 'MANTER' });
  const [estado, setEstado] = useState('carregando');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([fitnessApi.getProfile(), fitnessApi.listarPesos()])
      .then(([resposta, pesos]) => {
        let dados = resposta.data || {};
        const ultimoPeso = obterUltimoRegistroPeso(pesos);
        if (ultimoPeso) dados = { ...dados, peso: Number(ultimoPeso.peso) };
        const altura = normalizarAlturaCm(dados.altura);
        dados = { ...dados, altura: altura ?? dados.altura };
        setPerfil(dados);
        setFormulario({ nome: dados.nome || '', altura: dados.altura ?? '', objetivo: dados.objetivo || 'MANTER' });
        setEstado('pronto');
      })
      .catch(() => { setErro('Não foi possível carregar o perfil.'); setEstado('erro'); });
  }, []);

  const imc = calcularImc(perfil?.peso, perfil?.altura);
  const classificacao = classificarImc(imc);

  const salvar = async (evento) => {
    evento.preventDefault(); setErro(''); setMensagem('');
    const altura = Number(formulario.altura);
    if (altura < 50 || altura > 250) { setErro('Altura deve estar entre 50 e 250 cm.'); return; }
    setEstado('salvando');
    try {
      const resposta = await fitnessApi.updateProfile({ ...perfil, nome: formulario.nome.trim(), altura, objetivo: formulario.objetivo, peso: perfil.peso });
      setPerfil(resposta.data || { ...perfil, ...formulario, altura });
      setMensagem('Perfil atualizado com sucesso.'); setEstado('pronto');
    } catch (e) { setErro(e?.response?.data?.message || 'Falha ao salvar o perfil.'); setEstado('pronto'); }
  };

  if (estado === 'carregando') return <section className="perfilPage" aria-busy="true"><div className="perfilSkeleton" role="status">Carregando dados da sua conta…</div></section>;

  return <section className="perfilPage">
    <header className="perfilCabecalho"><p className="perfilEyebrow">Perfil</p><h2 className="perfilTitulo">Conta e dados pessoais</h2><p className="perfilSubtitulo">Gerencie seus dados sem duplicar os registros da evolução corporal.</p></header>
    {erro && <p className="perfilErro" role="alert">{erro}</p>}{mensagem && <p className="perfilSucesso" aria-live="polite">{mensagem}</p>}

    <form className="perfilSecoes" onSubmit={salvar}>
      <section className="perfilCard" aria-labelledby="dados-conta"><h3 id="dados-conta">Dados da conta</h3><div className="perfilLinha"><label className="perfilCampo">Nome<input value={formulario.nome} onChange={(e) => setFormulario((p) => ({ ...p, nome: e.target.value }))} required /></label><label className="perfilCampo">E-mail<input value={perfil?.email || ''} readOnly aria-describedby="email-ajuda" /></label></div><p id="email-ajuda" className="perfilMuted">A alteração de e-mail ainda não está disponível.</p></section>

      <section className="perfilCard" aria-labelledby="dados-corporais"><div className="perfilTituloLinha"><h3 id="dados-corporais">Dados corporais</h3><Link to="/dashboard/evolucao">Abrir Evolução</Link></div><div className="perfilStatsGrid"><article><span>Peso atual</span><strong>{perfil?.peso ? `${perfil.peso} kg` : 'Sem registro'}</strong><Link to="/dashboard/evolucao">Registrar peso</Link></article><article><span>IMC</span><strong>{imc ?? 'Dados insuficientes'}</strong>{classificacao && <em data-tom={tonalidadeImc(classificacao)}>{classificacao}</em>}</article></div><label className="perfilCampo">Altura (cm)<input type="number" min="50" max="250" value={formulario.altura} onChange={(e) => setFormulario((p) => ({ ...p, altura: e.target.value }))} required /></label><aside className="perfilAviso"><Info size={19} aria-hidden="true" /><p><strong>IMC é apenas uma referência matemática.</strong> Ele não distingue massa magra de gordura e não deve ser usado isoladamente como diagnóstico.</p></aside></section>

      <section className="perfilCard" aria-labelledby="objetivos"><h3 id="objetivos">Objetivos</h3><label className="perfilCampo">Objetivo principal<select value={formulario.objetivo} onChange={(e) => setFormulario((p) => ({ ...p, objetivo: e.target.value }))}>{OBJETIVOS.map((item) => <option key={item.valor} value={item.valor}>{item.label}</option>)}</select></label><Link to="/dashboard/dieta">Revisar metas nutricionais</Link></section>

      <section className="perfilCard" aria-labelledby="privacidade"><h3 id="privacidade">Privacidade</h3><div className="perfilPrivacidade"><ShieldCheck size={22} aria-hidden="true" /><p>Fotos de progresso e dados pessoais são acessíveis somente pela conta autenticada.</p></div><div className="perfilPrivacidade"><LockKeyhole size={22} aria-hidden="true" /><p>Senha, exportação e exclusão da conta ficam na área protegida de Configurações.</p></div><Link to="/dashboard/configuracoes">Abrir configurações de segurança</Link></section>

      <button type="submit" className="perfilBotao" disabled={estado === 'salvando'}>{estado === 'salvando' ? 'Salvando…' : 'Salvar perfil'}</button>
    </form>
  </section>;
}
