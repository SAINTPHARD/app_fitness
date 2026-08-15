import { useEffect, useMemo, useState } from 'react';
import { Camera, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import GraficoEvolucaoPeso from '../Home/components/GraficoEvolucaoPeso';
import { obterDataDeHojeISO } from '../Dieta/utils/calendario';
import { fitnessApi } from '../../../services/fitnessApi';
import estilos from './Evolucao.module.css';

const CHAVE_PESOS = 'home-historico-peso';
const CHAVE_MEDIDAS = 'evolucao-medidas';
const CHAVE_FOTOS = 'evolucao-fotos';
const MAX_FOTOS = 6;
const MAX_HISTORICO = 30;

const MEDIDAS_VAZIAS = { cintura: '', braco: '', perna: '', gordura: '' };
const PESO_VAZIO = { data: obterDataDeHojeISO(), peso: '' };

const LIMITES_MEDIDAS = {
  cintura: { min: 30, max: 200, rotulo: 'Cintura' },
  braco: { min: 10, max: 80, rotulo: 'Braço' },
  perna: { min: 20, max: 100, rotulo: 'Perna' },
  gordura: { min: 2, max: 70, rotulo: 'Gordura corporal' },
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
  return erro?.response?.data?.message || erro?.message || fallback;
}

function normalizarMedidas(formulario) {
  return {
    data: formulario.data || obterDataDeHojeISO(),
    cintura: formulario.cintura ? Number(formulario.cintura) : null,
    braco: formulario.braco ? Number(formulario.braco) : null,
    perna: formulario.perna ? Number(formulario.perna) : null,
    gordura: formulario.gordura ? Number(formulario.gordura) : null,
  };
}

function validarMedidas(registro) {
  if (!registro.cintura && !registro.braco && !registro.perna && !registro.gordura) {
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

  useEffect(() => {
    let cancelado = false;

    async function carregarEvolucao() {
      setCarregando(true);

      try {
        const [pesosApi, medidasApi, fotosApi] = await Promise.all([
          fitnessApi.listarPesos(),
          fitnessApi.listarMedidas(),
          fitnessApi.listarFotos(),
        ]);

        if (cancelado) return;

        const [pesos, medidas, fotosImportadas] = await Promise.all([
          importarRegistrosLocais(pesosApi, CHAVE_PESOS, fitnessApi.criarPeso),
          importarRegistrosLocais(medidasApi, CHAVE_MEDIDAS, fitnessApi.criarMedida),
          importarRegistrosLocais(fotosApi, CHAVE_FOTOS, fitnessApi.criarFoto),
        ]);

        if (!cancelado) {
          setHistoricoPeso(ordenarPorData(pesos).slice(-MAX_HISTORICO));
          setHistoricoMedidas(ordenarPorData(medidas).slice(-MAX_HISTORICO));
          setFotos(ordenarPorData(fotosImportadas).slice(-MAX_FOTOS));
        }
      } catch (erro) {
        console.error('Falha ao carregar evolução:', erro);
        if (!cancelado) {
          setHistoricoPeso(lerJSON(CHAVE_PESOS, []));
          setHistoricoMedidas(lerJSON(CHAVE_MEDIDAS, []));
          setFotos(lerJSON(CHAVE_FOTOS, []));
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
    if (historicoPeso.length < 2) return null;
    const primeiro = Number(historicoPeso[0].peso);
    const ultimo = Number(historicoPeso[historicoPeso.length - 1].peso);
    return Number((ultimo - primeiro).toFixed(1));
  }, [historicoPeso]);

  const salvarPeso = async (evento) => {
    evento.preventDefault();
    setErroPeso('');

    const registro = { data: formPeso.data, peso: Number(formPeso.peso) };
    if (registro.peso < 20 || registro.peso > 300) {
      setErroPeso('Peso deve estar entre 20 e 300 kg.');
      return;
    }

    try {
      const salvo = await fitnessApi.criarPeso(registro);
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
      const salvo = await fitnessApi.atualizarPeso(edicaoPeso.id, registro);
      setHistoricoPeso((anterior) => trocarRegistro(anterior, salvo));
      setEdicaoPeso(null);
    } catch (erro) {
      setErroPeso(mensagemErroApi(erro, 'Falha ao atualizar peso.'));
    }
  };

  const removerPeso = async (id) => {
    try {
      await fitnessApi.removerPeso(id);
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

  const adicionarFoto = (evento) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;

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
      try {
        const salva = await fitnessApi.criarFoto({
          data: obterDataDeHojeISO(),
          src: leitor.result,
        });
        setFotos((anterior) => ordenarPorData([...anterior, salva]).slice(-MAX_FOTOS));
      } catch (erro) {
        setErroFoto(mensagemErroApi(erro, 'Falha ao salvar foto.'));
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
        <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} />
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
          <label>
            Cintura (cm)
            <input
              type="number"
              step="0.1"
              min={LIMITES_MEDIDAS.cintura.min}
              max={LIMITES_MEDIDAS.cintura.max}
              value={formMedidas.cintura}
              onChange={(e) => setFormMedidas((p) => ({ ...p, cintura: e.target.value }))}
            />
          </label>
          <label>
            Braço (cm)
            <input
              type="number"
              step="0.1"
              min={LIMITES_MEDIDAS.braco.min}
              max={LIMITES_MEDIDAS.braco.max}
              value={formMedidas.braco}
              onChange={(e) => setFormMedidas((p) => ({ ...p, braco: e.target.value }))}
            />
          </label>
          <label>
            Perna (cm)
            <input
              type="number"
              step="0.1"
              min={LIMITES_MEDIDAS.perna.min}
              max={LIMITES_MEDIDAS.perna.max}
              value={formMedidas.perna}
              onChange={(e) => setFormMedidas((p) => ({ ...p, perna: e.target.value }))}
            />
          </label>
          <label>
            Gordura (%)
            <input
              type="number"
              step="0.1"
              min={LIMITES_MEDIDAS.gordura.min}
              max={LIMITES_MEDIDAS.gordura.max}
              value={formMedidas.gordura}
              onChange={(e) => setFormMedidas((p) => ({ ...p, gordura: e.target.value }))}
            />
          </label>
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
                        {[
                          item.cintura != null && `Cintura ${item.cintura}cm`,
                          item.braco != null && `Braço ${item.braco}cm`,
                          item.perna != null && `Perna ${item.perna}cm`,
                          item.gordura != null && `${item.gordura}% gordura`,
                        ]
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
        <div className={estilos.fotosCabecalho}>
          <h3 className={estilos.cartaoTitulo}>Fotos de progresso</h3>
          <label className={estilos.botaoSecundario}>
            <Plus size={16} strokeWidth={2.5} />
            Adicionar
            <input type="file" accept="image/*" onChange={adicionarFoto} hidden />
          </label>
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
                <img src={foto.src} alt={`Progresso de ${formatarDataCurta(foto.data)}`} />
                <figcaption>
                  <span>{formatarDataCurta(foto.data)}</span>
                  {confirmacao === `foto-${foto.id}` ? (
                    <span className={estilos.confirmacaoInline}>
                      Remover?
                      <button type="button" onClick={() => removerFoto(foto.id)}>Sim</button>
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
