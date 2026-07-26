import { useEffect, useState } from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import GraficoEvolucaoPeso from '../Home/components/GraficoEvolucaoPeso';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import { obterDataDeHojeISO } from '../Dieta/utils/calendario';
import estilos from './Evolucao.module.css';

const CHAVE_MEDIDAS = 'evolucao-medidas';
const CHAVE_FOTOS = 'evolucao-fotos';
const MAX_FOTOS = 6;
const MAX_HISTORICO_MEDIDAS = 30;

const MEDIDAS_VAZIAS = { cintura: '', braco: '', perna: '', gordura: '' };

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

export default function EvolucaoPage() {
  const { historicoPeso, variacaoPeso, carregando } = usePerfilResumo();
  const [historicoMedidas, setHistoricoMedidas] = useState(() => lerJSON(CHAVE_MEDIDAS, []));
  const [fotos, setFotos] = useState(() => lerJSON(CHAVE_FOTOS, []));
  const [formMedidas, setFormMedidas] = useState(MEDIDAS_VAZIAS);
  const [erroFoto, setErroFoto] = useState('');

  useEffect(() => {
    window.localStorage.setItem(CHAVE_MEDIDAS, JSON.stringify(historicoMedidas));
  }, [historicoMedidas]);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_FOTOS, JSON.stringify(fotos));
  }, [fotos]);

  const ultimaMedida = historicoMedidas.length > 0 ? historicoMedidas[historicoMedidas.length - 1] : null;

  const salvarMedidas = (evento) => {
    evento.preventDefault();
    const registro = {
      data: obterDataDeHojeISO(),
      cintura: formMedidas.cintura ? Number(formMedidas.cintura) : null,
      braco: formMedidas.braco ? Number(formMedidas.braco) : null,
      perna: formMedidas.perna ? Number(formMedidas.perna) : null,
      gordura: formMedidas.gordura ? Number(formMedidas.gordura) : null,
    };

    if (!registro.cintura && !registro.braco && !registro.perna && !registro.gordura) return;

    setHistoricoMedidas((anterior) => {
      const semHoje = anterior.filter((item) => item.data !== registro.data);
      return [...semHoje, registro].slice(-MAX_HISTORICO_MEDIDAS);
    });
    setFormMedidas(MEDIDAS_VAZIAS);
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
    leitor.onload = () => {
      setFotos((anterior) =>
        [
          ...anterior,
          {
            id: Date.now(),
            data: obterDataDeHojeISO(),
            src: leitor.result,
          },
        ].slice(-MAX_FOTOS)
      );
    };
    leitor.readAsDataURL(arquivo);
  };

  const removerFoto = (id) => {
    setFotos((anterior) => anterior.filter((foto) => foto.id !== id));
  };

  return (
    <section className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <p className={estilos.eyebrow}>Evolução</p>
        <h2 className={estilos.titulo}>Sua jornada ao longo do tempo</h2>
        <p className={estilos.subtitulo}>Peso, medidas corporais e fotos de progresso — tudo no mesmo lugar.</p>
      </div>

      {!carregando && <GraficoEvolucaoPeso historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} />}

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
            Cintura (cm)
            <input
              type="number"
              step="0.1"
              min="0"
              value={formMedidas.cintura}
              onChange={(e) => setFormMedidas((p) => ({ ...p, cintura: e.target.value }))}
            />
          </label>
          <label>
            Braço (cm)
            <input
              type="number"
              step="0.1"
              min="0"
              value={formMedidas.braco}
              onChange={(e) => setFormMedidas((p) => ({ ...p, braco: e.target.value }))}
            />
          </label>
          <label>
            Perna (cm)
            <input
              type="number"
              step="0.1"
              min="0"
              value={formMedidas.perna}
              onChange={(e) => setFormMedidas((p) => ({ ...p, perna: e.target.value }))}
            />
          </label>
          <label>
            Gordura (%)
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formMedidas.gordura}
              onChange={(e) => setFormMedidas((p) => ({ ...p, gordura: e.target.value }))}
            />
          </label>
          <button type="submit" className={estilos.botaoPrimario}>
            Registrar medidas
          </button>
        </form>

        {historicoMedidas.length > 0 && (
          <div className={estilos.listaHistorico}>
            <h4>Histórico recente</h4>
            <ul>
              {[...historicoMedidas].reverse().slice(0, 5).map((item) => (
                <li key={item.data}>
                  <strong>{formatarDataCurta(item.data)}</strong>
                  <span>
                    {[
                      item.cintura != null && `Cintura ${item.cintura}cm`,
                      item.braco != null && `Braço ${item.braco}cm`,
                      item.perna != null && `Perna ${item.perna}cm`,
                      item.gordura != null && `${item.gordura}% gordura`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
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
            <p>Ainda não há fotos. Adicione até {MAX_FOTOS} imagens locais para acompanhar o progresso.</p>
          </div>
        ) : (
          <div className={estilos.gradeFotos}>
            {fotos.map((foto) => (
              <figure key={foto.id} className={estilos.fotoItem}>
                <img src={foto.src} alt={`Progresso de ${formatarDataCurta(foto.data)}`} />
                <figcaption>
                  <span>{formatarDataCurta(foto.data)}</span>
                  <button type="button" onClick={() => removerFoto(foto.id)} aria-label="Remover foto">
                    <Trash2 size={14} />
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
