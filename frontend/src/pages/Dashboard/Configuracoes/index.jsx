import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, KeyRound, Trash2 } from 'lucide-react';
import { useTema } from '../../../hooks/useTema';
import { fitnessApi } from '../../../services/fitnessApi';
import { authService } from '../../../services/authService';
import estilos from './Configuracoes.module.css';

const PREFERENCIAS_FUTURAS = [
  ['Unidade de peso', 'Quilogramas (kg)', 'kg / lb'], ['Unidade de medida', 'Centímetros (cm)', 'cm / pol'],
  ['Nível de atividade', 'Configuração personalizada', 'Metas futuras'], ['Primeiro dia da semana', 'Segunda-feira', 'Calendário'],
  ['Notificações', 'Lembretes de refeições e treino', 'Permissões'],
];

export default function ConfiguracoesPage() {
  const { ehEscuro, alternarTema } = useTema();
  const navigate = useNavigate();
  const [senha, setSenha] = useState({ atual: '', nova: '', repetir: '' });
  const [exclusao, setExclusao] = useState({ senha: '', texto: '' });
  const [processando, setProcessando] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const alterarSenha = async (evento) => {
    evento.preventDefault(); setErro(''); setMensagem('');
    if (senha.nova !== senha.repetir) { setErro('A confirmação da nova senha não corresponde.'); return; }
    setProcessando('senha');
    try { await fitnessApi.alterarSenha(senha.atual, senha.nova); setSenha({ atual: '', nova: '', repetir: '' }); setMensagem('Senha alterada com sucesso.'); }
    catch (e) { setErro(e?.response?.data?.message || 'Não foi possível alterar a senha.'); }
    finally { setProcessando(''); }
  };

  const excluirConta = async (evento) => {
    evento.preventDefault(); setErro(''); setMensagem('');
    if (exclusao.texto !== 'EXCLUIR MINHA CONTA') { setErro('Digite exatamente EXCLUIR MINHA CONTA para confirmar.'); return; }
    setProcessando('exclusao');
    try { await fitnessApi.excluirMinhaConta(exclusao.senha, exclusao.texto); authService.logout(); navigate('/login', { replace: true }); }
    catch (e) { setErro(e?.response?.data?.message || 'Não foi possível excluir a conta.'); setProcessando(''); }
  };

  return <section className={estilos.pagina}>
    <header className={estilos.cabecalho}><p className={estilos.eyebrow}>Configurações</p><h2 className={estilos.titulo}>Preferências e segurança</h2><p className={estilos.subtitulo}>Ajustes do aplicativo e ações protegidas da conta.</p></header>
    {erro && <p className={estilos.erro} role="alert">{erro}</p>}{mensagem && <p className={estilos.sucesso} aria-live="polite">{mensagem}</p>}

    <section className={estilos.cartao}><h3 className={estilos.cartaoTitulo}>Aparência</h3><div className={estilos.linha}><div><p className={estilos.linhaLabel}>Modo escuro</p><p className={estilos.linhaDescricao}>Troca o tema em todo o aplicativo.</p></div><button type="button" role="switch" aria-label="Alternar modo escuro" aria-checked={ehEscuro} onClick={alternarTema} className={`${estilos.interruptor} ${ehEscuro ? estilos.interruptorAtivo : ''}`}><span className={estilos.interruptorBolinha} /></button></div></section>

    <section className={estilos.cartao}><h3 className={estilos.cartaoTitulo}>Preferências</h3>{PREFERENCIAS_FUTURAS.map(([titulo, valor, contexto]) => <div className={`${estilos.linha} ${estilos.linhaDesabilitada}`} key={titulo}><div><p className={estilos.linhaLabel}>{titulo}</p><p className={estilos.linhaDescricao}>{valor} · {contexto}</p></div><span className={estilos.badgeEmBreve}>Em breve</span></div>)}</section>

    <section className={estilos.cartao}><h3 className={estilos.cartaoTitulo}>Seus dados</h3><div className={estilos.linha}><div><p className={estilos.linhaLabel}>Exportação de dados</p><p className={estilos.linhaDescricao}>Exporte dados do período escolhido em CSV ou PDF.</p></div><Link className={estilos.botaoSecundario} to="/dashboard/relatorios"><Download size={17} aria-hidden="true" /> Abrir relatórios</Link></div></section>

    <section className={estilos.cartao}><h3 className={estilos.cartaoTitulo}>Segurança da conta</h3><form className={estilos.formSeguranca} onSubmit={alterarSenha}><div className={estilos.formTitulo}><KeyRound size={20} aria-hidden="true" /><div><strong>Alterar senha</strong><small>Confirme sua senha atual antes da alteração.</small></div></div><label>Senha atual<input type="password" autoComplete="current-password" value={senha.atual} onChange={(e) => setSenha((p) => ({ ...p, atual: e.target.value }))} required /></label><label>Nova senha<input type="password" minLength="8" maxLength="72" autoComplete="new-password" value={senha.nova} onChange={(e) => setSenha((p) => ({ ...p, nova: e.target.value }))} required /></label><label>Confirmar nova senha<input type="password" minLength="8" maxLength="72" autoComplete="new-password" value={senha.repetir} onChange={(e) => setSenha((p) => ({ ...p, repetir: e.target.value }))} required /></label><button type="submit" className={estilos.botaoPrimario} disabled={processando === 'senha'}>{processando === 'senha' ? 'Alterando…' : 'Alterar senha'}</button></form></section>

    <section className={`${estilos.cartao} ${estilos.zonaPerigo}`}><h3 className={estilos.cartaoTitulo}>Excluir conta</h3><p className={estilos.linhaDescricao}>A exclusão é permanente e remove os dados associados à sua conta.</p><form className={estilos.formSeguranca} onSubmit={excluirConta}><div className={estilos.formTitulo}><Trash2 size={20} aria-hidden="true" /><strong>Confirmação forte</strong></div><label>Senha atual<input type="password" autoComplete="current-password" value={exclusao.senha} onChange={(e) => setExclusao((p) => ({ ...p, senha: e.target.value }))} required /></label><label>Digite EXCLUIR MINHA CONTA<input value={exclusao.texto} onChange={(e) => setExclusao((p) => ({ ...p, texto: e.target.value }))} required /></label><button type="submit" className={estilos.botaoPerigo} disabled={processando === 'exclusao' || exclusao.texto !== 'EXCLUIR MINHA CONTA'}>{processando === 'exclusao' ? 'Excluindo…' : 'Excluir permanentemente'}</button></form></section>
  </section>;
}
