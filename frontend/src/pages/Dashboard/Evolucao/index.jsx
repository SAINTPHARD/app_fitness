import { useEffect, useMemo, useState } from 'react';
import { Camera, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import GraficoEvolucaoPeso from '../Home/components/GraficoEvolucaoPeso';
import { obterDataDeHojeISO } from '../Dieta/utils/calendario';
import { fitnessApi } from '../../../services/fitnessApi';
import { pesoService } from '../../../services/dominio/pesoService';
import { mapearErroApi } from '../../../utils/erroApi';
import { criarDataLocal } from '../../../utils/dataCivil';
import { useBloqueioMutacao } from '../../../hooks/useBloqueioMutacao';
import estilos from './Evolucao.module.css';

const CHAVE_PESOS = 'home-historico-peso';
const CHAVE_MEDIDAS = 'evolucao-medidas';
const MAX_FOTOS = 6;
const MAX_HISTORICO = 30;

const CAMPOS_MEDIDAS = [
  ['cintura', 'Cintura', 30, 200], ['torax', 'Tórax', 30, 250], ['quadril', 'Quadril', 30, 250],
  ['pescoco', 'Pescoço', 15, 100], ['braco', 'Braço (registro anterior)', 10, 80], ['perna', 'Perna (registro anterior)', 20, 100],
  ['bracoDireito', 'Braço direito', 10, 100],
  ['bracoEsquerdo', 'Braço esquerdo', 10, 100], ['pernaDireita', 'Perna direita', 20, 150],
  ['pernaEsquerda', 'Perna esquerda', 20, 150], ['panturrilhaDireita', 'Panturrilha direita', 10, 100],
  ['panturrilhaEsquerda', 'Panturrilha esquerda', 10, 100], ['gordura', 'Gordura corporal', 2, 70],
];
const MEDIDAS_VAZIAS = Object.fromEntries(CAMPOS_MEDIDAS.map(([campo]) => [campo, '']));
const PESO_VAZIO = { data: obterDataDeHojeISO(), peso: '' };
const TIPOS_CONFIGURAVEIS = [
  { valor: 'torax', rotulo: 'Tórax' }, { valor: 'quadril', rotulo: 'Quadril' },
  { valor: 'pescoco', rotulo: 'Pescoço' }, { valor: 'braco', rotulo: 'Braço', lateral: true },
  { valor: 'perna', rotulo: 'Perna', lateral: true }, { valor: 'panturrilha', rotulo: 'Panturrilha', lateral: true },
];

const LIMITES_MEDIDAS = {
  cintura: { min: 30, max: 200, rotulo: 'Cintura' },
  gordura: { min: 2, max: 70, rotulo: 'Gordura corporal' },
  ...Object.fromEntries(CAMPOS_MEDIDAS.filter(([campo]) => !['cintura', 'gordura'].includes(campo)).map(([campo, rotulo, min, max]) => [campo, { min, max, rotulo }])),
};

function lerJSON(chave, padrao) {
  if (typeof window === 'undefined') return padrao;
  try {
    const salvo = window.localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : padrao;
  } catch {
    return padrao;
  }
}

function formatarDataCurta(iso) {
  if (!iso) return '---';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function ordenarPorData(lista) {
  return [...lista].sort((a, b) => String(a.data).localeCompare(String(b.data)));
}

function trocarRegistro(lista, registro) {
  const semAtual = lista.filter((item) => item.id !== registro.id && item.data !== registro.data);
  return ordenarPorData([...semAtual, registro]).slice(-MAX_HISTORICO);
}

function mensagemErroApi(erro, fallback) {
  const detalhes = erro?.response?.data?.mensagens || erro?.response?.data?.details;
  if (Array.isArray(detalhes) && detalhes.length > 0) return detalhes[0];
  return mapearErroApi(erro, fallback.replace(/^Falha ao /, '')).mensagem;
}

function normalizarMedidas(formulario) {
  return { data: formulario.data || obterDataDeHojeISO(), ...Object.fromEntries(CAMPOS_MEDIDAS.map(([campo]) => [campo, formulario[campo] ? Number(formulario[campo]) : null])) };
}

function validarMedidas(registro) {
  if (!CAMPOS_MEDIDAS.some(([campo]) => registro[campo] != null)) {
    return 'Informe ao menos uma medida.';
  }

  for (const [campo, { min, max, rotulo }] of Object.entries(LIMITES_MEDIDAS)) {
    const valor = registro[campo];
    if (valor != null && (valor < min || valor > max)) {
      return `${rotulo} deve estar entre ${min} e ${max}${campo === 'gordura' ? '%' : 'cm'}.`;
    }
  }

  return '';
}

async function importarRegistrosLocais(listaBackend, chave, salvar) {
  if (listaBackend.length > 0) return listaBackend;

  const locais = lerJSON(chave, []);
  if (locais.length === 0) return listaBackend;

  try {
    const importados = await Promise.all(locais.map((item) => salvar(item)));
    return ordenarPorData(importados);
  } catch (erro) {
    console.error(`Falha ao importar ${chave} para o backend:`, erro);
    return ordenarPorData(locais);
  }
}

export default function EvolucaoPage() {
  const executarComBloqueio = useBloqueioMutacao();
  const [historicoPeso, setHistoricoPeso] = useState([]);
  const [historicoMedidas, setHistoricoMedidas] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [formPeso, setFormPeso] = useState(PESO_VAZIO);
  const [formMedidas, setFormMedidas] = useState({ data: obterDataDeHojeISO(), ...MEDIDAS_VAZIAS });
  const [edicaoPeso, setEdicaoPeso] = useState(null);
  const [edicaoMedida, setEdicaoMedida] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroFoto, setErroFoto] = useState('');
  const [erroPeso, setErroPeso] = useState('');
  const [erroMedidas, setErroMedidas] = useState('');
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [formFoto, setFormFoto] = useState({ data: obterDataDeHojeISO(), pose: 'FRENTE', descricao: '' });
  const [periodoGrafico, setPeriodoGrafico] = useState('mensal');
  const [metaPeso, setMetaPeso] = useState('');
  const [camposAtivos, setCamposAtivos] = useState(['cintura', 'gordura']);
  const [novaMedida, setNovaMedida] = useState('torax');
  const [ladoMedida, setLadoMedida] = useState('Direito');

  useEffect(() => {
    let cancelado = false;

    async function carregarEvolucao() {
      setCarregando(true);

      try {
        const [pesosApi, medidasApi, fotosApi] = await Promise.all([
          pesoService.listar(),
          fitnessApi.listarMedidas(),
          fitnessApi.listarFotos(),
        ]);

        if (cancelado) return;

        const [pesos, medidas] = await Promise.all([
          importarRegistrosLocais(pesosApi, CHAVE_PESOS, pesoService.criar),
          importarRegistrosLocais(medidasApi, CHAVE_MEDIDAS, fitnessApi.criarMedida),
        ]);
        const fotosPrivadas = await Promise.all(fotosApi.map(async (foto) => ({ ...foto, src: await fitnessApi.obterFotoPrivada(foto.id) })));

        if (!cancelado) {
          setHistoricoPeso(ordenarPorData(pesos).slice(-MAX_HISTORICO));
          setHistoricoMedidas(ordenarPorData(medidas).slice(-MAX_HISTORICO));
          setFotos(ordenarPorData(fotosPrivadas).slice(-MAX_FOTOS));
        }
      } catch (erro) {
        console.error('Falha ao carregar evolução:', erro);
        if (!cancelado) {
          setHistoricoPeso(lerJSON(CHAVE_PESOS, []));
          setHistoricoMedidas(lerJSON(CHAVE_MEDIDAS, []));
          setFotos([]);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarEvolucao();

    return () => {
      cancelado = true;
    };
  }, []);

  const ultimaMedida = historicoMedidas.length > 0 ? historicoMedidas[historicoMedidas.length - 1] : null;

  const variacaoPeso = useMemo(() => {
    const dias = periodoGrafico === 'semanal' ? 7 : 30;
    const limite = new Date(); limite.setDate(limite.getDate() - dias);
    const periodo = historicoPeso.filter((item) => criarDataLocal(item.data) >= limite);
    if (periodo.length < 2) return null;
    const primeiro = Number(periodo[0].peso);
    const ultimo = Number(periodo[periodo.length - 1].peso);
    return Number((ultimo - primeiro).toFixed(1));
  }, [historicoPeso, periodoGrafico]);

  const salvarPeso = async (evento) => {
    evento.preventDefault();
    setErroPeso('');

    const registro = { data: formPeso.data, peso: Number(formPeso.peso) };
    if (registro.peso < 20 || registro.peso > 300) {
      setErroPeso('Peso deve estar entre 20 e 300 kg.');
      return;
    }

    const existente = historicoPeso.find((item) => item.data === registro.data);
    if (existente && !window.confirm(`Já existe um peso em ${formatarDataCurta(registro.data)}. Deseja substituí-lo?`)) return;
    try {
      const salvo = await executarComBloqueio(`peso:${registro.data}`, () => pesoService.criar(registro));
      if (!salvo) return;
      setHistoricoPeso((anterior) => trocarRegistro(anterior, salvo));
      setFormPeso(PESO_VAZIO);
    } catch (erro) {
      setErroPeso(mensagemErroApi(erro, 'Falha ao registrar peso.'));
    }
  };

  const salvarEdicaoPeso = async () => {
    setErroPeso('');
    const registro = { data: edicaoPeso.data, peso: Number(edicaoPeso.peso) };

    try {
      const salvo = await executarComBloqueio(`peso:${registro.data}`, () => pesoService.atualizar(edicaoPeso.id, registro));
      if (!salvo) return;
      setHistoricoPeso((anterior) => trocarRegistro(anterior, salvo));
      setEdicaoPeso(null);
    } catch (erro) {
      setErroPeso(mensagemErroApi(erro, 'Falha ao atualizar peso.'));
    }
  };

  const removerPeso = async (id) => {
    try {
      await pesoService.remover(id);
      setHistoricoPeso((anterior) => anterior.filter((item) => item.id !== id));
      setConfirmacao(null);
    } catch (erro) {
      setErroPeso(mensagemErroApi(erro, 'Falha ao remover peso.'));
    }
  };

  const salvarMedidas = async (evento) => {
    evento.preventDefault();
    setErroMedidas('');

    const registro = normalizarMedidas(formMedidas);
    const erroValidacao = validarMedidas(registro);
    if (erroValidacao) {
      setErroMedidas(erroValidacao);
      return;
    }

    try {
      const salvo = await fitnessApi.criarMedida(registro);
      setHistoricoMedidas((anterior) => trocarRegistro(anterior, salvo));
      setFormMedidas({ data: obterDataDeHojeISO(), ...MEDIDAS_VAZIAS });
    } catch (erro) {
      setErroMedidas(mensagemErroApi(erro, 'Falha ao registrar medidas.'));
    }
  };

  const salvarEdicaoMedida = async () => {
    setErroMedidas('');
    const registro = normalizarMedidas(edicaoMedida);
    const erroValidacao = validarMedidas(registro);
    if (erroValidacao) {
      setErroMedidas(erroValidacao);
      return;
    }

    try {
      const salvo = await fitnessApi.atualizarMedida(edicaoMedida.id, registro);
      setHistoricoMedidas((anterior) => trocarRegistro(anterior, salvo));
      setEdicaoMedida(null);
    } catch (erro) {
      setErroMedidas(mensagemErroApi(erro, 'Falha ao atualizar medidas.'));
    }
  };

  const removerMedida = async (id) => {
    try {
      await fitnessApi.removerMedida(id);
      setHistoricoMedidas((anterior) => anterior.filter((item) => item.id !== id));
      setConfirmacao(null);
    } catch (erro) {
      setErroMedidas(mensagemErroApi(erro, 'Falha ao remover medidas.'));
    }
  };

  const adicionarCampoMedida = () => {
    const configuracao = TIPOS_CONFIGURAVEIS.find((item) => item.valor === novaMedida);
    const campo = configuracao?.lateral ? `${novaMedida}${ladoMedida}` : novaMedida;
    if (campo) setCamposAtivos((atuais) => [...new Set([...atuais, campo])]);
  };

  const adicionarFoto = (evento) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    if (!formFoto.data || !formFoto.pose) { setErroFoto('Informe a data e a pose antes de selecionar a foto.'); return; }

    if (fotos.length >= MAX_FOTOS) {
      setErroFoto(`Limite de ${MAX_FOTOS} fotos. Remova uma para adicionar outra.`);
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      setErroFoto('Selecione um arquivo de imagem.');
      return;
    }

    if (arquivo.size > 1.5 * 1024 * 1024) {
      setErroFoto('Use uma imagem com até 1,5 MB.');
      return;
    }

    setErroFoto('');
    const leitor = new FileReader();
    leitor.onload = async () => {
      setEnviandoFoto(true);
      try {
        const salva = await fitnessApi.criarFoto({
          ...formFoto,
          src: leitor.result,
        });
        const src = await fitnessApi.obterFotoPrivada(salva.id);
        setFotos((anterior) => ordenarPorData([...anterior, { ...salva, src }]).slice(-MAX_FOTOS));
        setFormFoto({ data: obterDataDeHojeISO(), pose: 'FRENTE', descricao: '' });
      } catch (erro) {
        setErroFoto(mensagemErroApi(erro, 'Falha ao salvar foto.'));
      } finally {
        setEnviandoFoto(false);
      }
    };
    leitor.readAsDataURL(arquivo);
  };

  const removerFoto = async (id) => {
    try {
      await fitnessApi.removerFoto(id);
      setFotos((anterior) => anterior.filter((foto) => foto.id !== id));
      setConfirmacao(null);
    } catch (erro) {
      setErroFoto(mensagemErroApi(erro, 'Falha ao remover foto.'));
    }
  };

  const renderAcoesHistorico = (tipo, item, aoEditar, aoRemover) => {
    const chave = `${tipo}-${item.id}`;
    const aguardandoConfirmacao = confirmacao === chave;

    if (aguardandoConfirmacao) {
      return (
        <span className={estilos.confirmacaoInline}>
          Remover?
          <button type="button" onClick={aoRemover}>Sim</button>
          <button type="button" onClick={() => setConfirmacao(null)}>Não</button>
        </span>
      );
    }

    return (
      <span className={estilos.acoesHistorico}>
        <button type="button" className={estilos.botaoIcone} onClick={aoEditar} aria-label="Editar registro">
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className={estilos.botaoIcone}
          onClick={() => setConfirmacao(chave)}
          aria-label="Remover registro"
        >
          <Trash2 size={14} />
        </button>
      </span>
    );
  };

  return (
    <section className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <p className={estilos.eyebrow}>Evolução</p>
        <h2 className={estilos.titulo}>Sua jornada ao longo do tempo</h2>
        <p className={estilos.subtitulo}>Peso, medidas corporais e fotos de progresso — tudo no mesmo lugar.</p>
      </div>

      {carregando ? (
        <p className={estilos.estadoTexto}>Carregando evolução...</p>
      ) : (
        <>
          <div className={estilos.controlesGrafico}>
            <label>Variação <select value={periodoGrafico} onChange={(e) => setPeriodoGrafico(e.target.value)}><option value="semanal">Semanal</option><option value="mensal">Mensal</option></select></label>
            <label>Meta de peso (kg) <input type="number" min="20" max="300" step="0.1" value={metaPeso} onChange={(e) => setMetaPeso(e.target.value)} placeholder="Opcional" /></label>
          </div>
          <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} metaPeso={metaPeso ? Number(metaPeso) : null} />
        </>
      )}

      <div className={estilos.cartao}>
        <h3 className={estilos.cartaoTitulo}>Peso corporal</h3>

        <form className={estilos.formMedidas} onSubmit={salvarPeso}>
          <label>
            Data
            <input
              type="date"
              value={formPeso.data}
              onChange={(e) => setFormPeso((p) => ({ ...p, data: e.target.value }))}
              required
            />
          </label>
          <label>
            Peso (kg)
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={formPeso.peso}
              onChange={(e) => setFormPeso((p) => ({ ...p, peso: e.target.value }))}
              required
            />
          </label>
          {erroPeso && <p className={estilos.erro}>{erroPeso}</p>}
          <button type="submit" className={estilos.botaoPrimario}>
            Registrar peso
          </button>
        </form>

        {historicoPeso.length > 0 && (
          <div className={estilos.listaHistorico}>
            <h4>Histórico recente</h4>
            <ul>
              {[...historicoPeso].reverse().slice(0, 5).map((item) => (
                <li key={item.id || item.data} className={estilos.linhaHistorico}>
                  {edicaoPeso?.id === item.id ? (
                    <span className={estilos.formEdicaoHistorico}>
                      <input
                        type="date"
                        value={edicaoPeso.data}
                        onChange={(e) => setEdicaoPeso((p) => ({ ...p, data: e.target.value }))}
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="300"
                        value={edicaoPeso.peso}
                        onChange={(e) => setEdicaoPeso((p) => ({ ...p, peso: e.target.value }))}
                      />
                      <button type="button" onClick={salvarEdicaoPeso} aria-label="Salvar edição">
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => setEdicaoPeso(null)} aria-label="Cancelar edição">
                        <X size={14} />
                      </button>
                    </span>
                  ) : (
                    <>
                      <span>
                        <strong>{formatarDataCurta(item.data)}</strong>
                        {Number(item.peso).toFixed(1)} kg
                      </span>
                      {item.id &&
                        renderAcoesHistorico(
                          'peso',
                          item,
                          () => setEdicaoPeso({ ...item, peso: String(item.peso) }),
                          () => removerPeso(item.id)
                        )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={estilos.cartao}>
        <h3 className={estilos.cartaoTitulo}>Medidas e % de gordura</h3>

        {ultimaMedida && (
          <div className={estilos.resumoMedidas}>
            <article>
              <span>Cintura</span>
              <strong>{ultimaMedida.cintura != null ? `${ultimaMedida.cintura} cm` : '---'}</strong>
            </article>
            <article>
              <span>Braço</span>
              <strong>{ultimaMedida.braco != null ? `${ultimaMedida.braco} cm` : '---'}</strong>
            </article>
            <article>
              <span>Perna</span>
              <strong>{ultimaMedida.perna != null ? `${ultimaMedida.perna} cm` : '---'}</strong>
            </article>
            <article>
              <span>Gordura</span>
              <strong>{ultimaMedida.gordura != null ? `${ultimaMedida.gordura}%` : '---'}</strong>
            </article>
          </div>
        )}

        <form className={estilos.formMedidas} onSubmit={salvarMedidas}>
          <label>
            Data
            <input
              type="date"
              value={formMedidas.data}
              onChange={(e) => setFormMedidas((p) => ({ ...p, data: e.target.value }))}
            />
          </label>
          {CAMPOS_MEDIDAS.filter(([campo]) => camposAtivos.includes(campo)).map(([campo, rotulo]) => <label key={campo}>{rotulo} ({campo === 'gordura' ? '%' : 'cm'})<input type="number" step="0.1" min={LIMITES_MEDIDAS[campo].min} max={LIMITES_MEDIDAS[campo].max} value={formMedidas[campo]} onChange={(e) => setFormMedidas((p) => ({ ...p, [campo]: e.target.value }))} /></label>)}
          <fieldset className={estilos.configuradorMedidas}>
            <legend>Adicionar medida opcional</legend>
            <select value={novaMedida} onChange={(e) => setNovaMedida(e.target.value)}>{TIPOS_CONFIGURAVEIS.map((item) => <option key={item.valor} value={item.valor}>{item.rotulo}</option>)}</select>
            {TIPOS_CONFIGURAVEIS.find((item) => item.valor === novaMedida)?.lateral && <select aria-label="Lado da medida" value={ladoMedida} onChange={(e) => setLadoMedida(e.target.value)}><option>Direito</option><option>Esquerdo</option></select>}
            <button type="button" className={estilos.botaoSecundario} onClick={adicionarCampoMedida}><Plus size={15} aria-hidden="true" /> Incluir campo</button>
          </fieldset>
          {erroMedidas && <p className={estilos.erro}>{erroMedidas}</p>}
          <button type="submit" className={estilos.botaoPrimario}>
            Registrar medidas
          </button>
        </form>

        {historicoMedidas.length > 0 && (
          <div className={estilos.listaHistorico}>
            <h4>Histórico recente</h4>
            <ul>
              {[...historicoMedidas].reverse().slice(0, 5).map((item) => (
                <li key={item.id || item.data} className={estilos.linhaHistorico}>
                  {edicaoMedida?.id === item.id ? (
                    <span className={estilos.formEdicaoHistorico}>
                      <input
                        type="date"
                        value={edicaoMedida.data}
                        onChange={(e) => setEdicaoMedida((p) => ({ ...p, data: e.target.value }))}
                      />
                      {Object.keys(MEDIDAS_VAZIAS).map((campo) => (
                        <input
                          key={campo}
                          type="number"
                          step="0.1"
                          placeholder={campo}
                          value={edicaoMedida[campo] ?? ''}
                          onChange={(e) => setEdicaoMedida((p) => ({ ...p, [campo]: e.target.value }))}
                        />
                      ))}
                      <button type="button" onClick={salvarEdicaoMedida} aria-label="Salvar edição">
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => setEdicaoMedida(null)} aria-label="Cancelar edição">
                        <X size={14} />
                      </button>
                    </span>
                  ) : (
                    <>
                      <span>
                        <strong>{formatarDataCurta(item.data)}</strong>
                        {CAMPOS_MEDIDAS.map(([campo, rotulo]) => item[campo] != null && `${rotulo} ${item[campo]}${campo === 'gordura' ? '%' : 'cm'}`)
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                      {item.id &&
                        renderAcoesHistorico(
                          'medida',
                          item,
                          () => setEdicaoMedida({ ...MEDIDAS_VAZIAS, ...item }),
                          () => removerMedida(item.id)
                        )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={estilos.cartao}>
        <aside className={estilos.avisoPrivacidade}><strong>Fotos privadas</strong><span>As imagens são armazenadas no backend e só podem ser acessadas com sua autenticação. Não use links públicos.</span></aside>
        <div className={estilos.fotosCabecalho}>
          <h3 className={estilos.cartaoTitulo}>Fotos de progresso</h3>
          <label className={estilos.botaoSecundario} aria-disabled={enviandoFoto}>
            <Plus size={16} strokeWidth={2.5} />
            {enviandoFoto ? 'Enviando…' : 'Adicionar'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={adicionarFoto} disabled={enviandoFoto} hidden />
          </label>
        </div>

        <div className={estilos.formFoto}>
          <label>Data<input type="date" required value={formFoto.data} onChange={(e) => setFormFoto((p) => ({ ...p, data: e.target.value }))} /></label>
          <label>Pose<select required value={formFoto.pose} onChange={(e) => setFormFoto((p) => ({ ...p, pose: e.target.value }))}><option value="FRENTE">Frente</option><option value="COSTAS">Costas</option><option value="LADO">Lado</option></select></label>
          <label>Descrição<input type="text" maxLength="500" value={formFoto.descricao} onChange={(e) => setFormFoto((p) => ({ ...p, descricao: e.target.value }))} placeholder="Opcional" /></label>
        </div>

        {erroFoto && <p className={estilos.erro}>{erroFoto}</p>}

        {fotos.length === 0 ? (
          <div className={estilos.vazioFotos}>
            <Camera size={28} strokeWidth={2} />
            <p>Ainda não há fotos. Adicione até {MAX_FOTOS} imagens para acompanhar o progresso.</p>
          </div>
        ) : (
          <div className={estilos.gradeFotos}>
            {fotos.map((foto) => (
              <figure key={foto.id || foto.src} className={estilos.fotoItem}>
                <img src={foto.src} alt={`Progresso de ${formatarDataCurta(foto.data)}`} loading="lazy" decoding="async" />
                <figcaption>
                  <span>{formatarDataCurta(foto.data)} · {foto.pose?.toLowerCase()}{foto.descricao ? ` · ${foto.descricao}` : ''}</span>
                  {confirmacao === `foto-${foto.id}` ? (
                    <span className={estilos.confirmacaoInline}>
                      Excluir permanentemente?
                      <button type="button" onClick={() => removerFoto(foto.id)}>Sim, excluir</button>
                      <button type="button" onClick={() => setConfirmacao(null)}>Não</button>
                    </span>
                  ) : (
                    foto.id && (
                      <button type="button" onClick={() => setConfirmacao(`foto-${foto.id}`)} aria-label="Remover foto">
                        <Trash2 size={14} />
                      </button>
                    )
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
