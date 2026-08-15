import { useEffect, useState } from 'react';
import { X, Sparkles, Info } from 'lucide-react';
import { validarMetas } from '../utils/validarMetas';
import { calcularMetasNutricionais } from '../utils/calculadoraMetabolica';
import { usePerfilResumo } from '../../../../hooks/usePerfilResumo';
import { fitnessApi } from '../../../../services/fitnessApi';

const CAMPOS_DO_FORMULARIO = [
  { chave: 'calorias', rotulo: 'Calorias', unidade: 'kcal', max: 10000 },
  { chave: 'proteinas', rotulo: 'Proteínas', unidade: 'g', max: 1000 },
  { chave: 'carboidratos', rotulo: 'Carboidratos', unidade: 'g', max: 1500 },
  { chave: 'gorduras', rotulo: 'Gorduras', unidade: 'g', max: 500 },
  { chave: 'aguaMl', rotulo: 'Água', unidade: 'ml', max: 10000 },
];

// Mesmas chaves do enum `Objetivo` do backend e do Onboarding — sem inventar
// uma segunda nomenclatura para o mesmo conceito.
const OBJETIVOS = [
  { valor: 'EMAGRECER', titulo: 'Emagrecimento' },
  { valor: 'MANTER', titulo: 'Manutenção' },
  { valor: 'HIPERTROFIA', titulo: 'Hipertrofia' },
];

const NIVEIS_ATIVIDADE = [
  { valor: 'SEDENTARIO', titulo: 'Sedentário' },
  { valor: 'LEVE', titulo: 'Levemente ativo' },
  { valor: 'ATIVO', titulo: 'Moderadamente ativo' },
  { valor: 'MUITO_ATIVO', titulo: 'Muito ativo' },
];

const DADOS_CORPORAIS_VAZIOS = { peso: '', altura: '', idade: '', sexo: '', nivelAtividade: '', objetivo: '' };

function lerPreferenciasLocais() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem('perfil-preferencias-locais')) || {};
  } catch {
    return {};
  }
}

/**
 * Modal de definição das metas diárias, com duas abas:
 *  - Assistente Inteligente: informa dados corporais e gera as metas pela
 *    equação de Mifflin-St Jeor (`calcularMetasNutricionais`).
 *  - Ajuste Manual: mostra/edita livremente as metas (geradas ou digitadas
 *    à mão) — é a mesma validação (`validarMetas`) e o mesmo fluxo de
 *    salvamento de antes, só ganhou uma origem alternativa para os valores.
 *
 * Mantém um estado de RASCUNHO local, independente das metas já salvas —
 * assim, se o usuário cancelar ou fechar sem validar, o estado global
 * (`useMetas`) nunca é tocado. Só chamamos `aoSalvar` depois que
 * `validarMetas` confirma que todos os campos são números válidos e não
 * negativos.
 */
export default function ModalMetas({ aberto, metasAtuais, aoFechar, aoSalvar }) {
  const { perfil } = usePerfilResumo();

  const [aba, setAba] = useState('assistente');
  const [dadosCorporais, setDadosCorporais] = useState(DADOS_CORPORAIS_VAZIOS);
  const [resultadoCalculo, setResultadoCalculo] = useState(null);
  const [erroCalculo, setErroCalculo] = useState('');

  const [rascunho, setRascunho] = useState(() => ({
    calorias: metasAtuais.calorias || '',
    proteinas: metasAtuais.proteinas || '',
    carboidratos: metasAtuais.carboidratos || '',
    gorduras: metasAtuais.gorduras || '',
    aguaMl: metasAtuais.aguaMl || '',
  }));
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroEnvio, setErroEnvio] = useState('');

  // Ao abrir o modal, pré-preenche os dados corporais com o que já se sabe
  // do usuário (perfil real + preferência de nível de atividade guardada
  // localmente no Onboarding) — evita pedir de novo o que já foi informado.
  useEffect(() => {
    if (!aberto || !perfil) return;

    const preferenciasLocais = lerPreferenciasLocais();

    setDadosCorporais((prev) => ({
      ...prev,
      peso: prev.peso || String(perfil.peso || ''),
      altura: prev.altura || String(perfil.altura || ''),
      idade: prev.idade || String(perfil.idade || ''),
      sexo: prev.sexo || perfil.sexo || '',
      objetivo: prev.objetivo || perfil.objetivo || '',
      nivelAtividade: prev.nivelAtividade || preferenciasLocais.nivelAtividade || '',
    }));
  }, [aberto, perfil]);

  useEffect(() => {
    if (!aberto) return;
    setRascunho({
      calorias: metasAtuais.calorias || '',
      proteinas: metasAtuais.proteinas || '',
      carboidratos: metasAtuais.carboidratos || '',
      gorduras: metasAtuais.gorduras || '',
      aguaMl: metasAtuais.aguaMl || '',
    });
    setErros({});
    setErroEnvio('');
    setMensagem('');
  }, [aberto, metasAtuais]);

  // Blindagem: se o modal não estiver aberto, não renderiza nada (evita
  // manter um formulário escondido no DOM ocupando espaço/JS à toa).
  if (!aberto) return null;

  const atualizarCampo = (campo, valor) => {
    setRascunho((prev) => ({ ...prev, [campo]: valor }));
  };

  const atualizarDadoCorporal = (campo, valor) => {
    setDadosCorporais((prev) => ({ ...prev, [campo]: valor }));
  };

  const gerarMetasAutomaticamente = () => {
    const resultado = calcularMetasNutricionais(dadosCorporais);

    if (!resultado) {
      setErroCalculo('Preencha peso, altura, idade e sexo para calcular.');
      return;
    }

    setErroCalculo('');
    setResultadoCalculo(resultado);
    setRascunho({
      calorias: String(resultado.metas.calorias),
      proteinas: String(resultado.metas.proteinas),
      carboidratos: String(resultado.metas.carboidratos),
      gorduras: String(resultado.metas.gorduras),
      aguaMl: String(metasAtuais.aguaMl || 2000),
    });
    setAba('manual');
  };

  const lidarComEnvio = async (evento) => {
    evento.preventDefault();

    const resultadoValidacao = validarMetas(rascunho);

    if (!resultadoValidacao.valido) {
      setErros(resultadoValidacao.erros);
      return;
    }

    setSalvando(true);
    setErroEnvio('');
    setMensagem('');
    setErros({});

    try {
      await aoSalvar(rascunho);

      // Persistência dos dados corporais: atualiza o perfil no backend (o PUT
      // substitui o registro inteiro, então mesclamos com o que já veio do
      // GET para não perder nome/e-mail) e guarda o nível de atividade — o
      // backend ainda não tem coluna para isso, mesma estratégia do
      // Onboarding. Uma falha aqui não desfaz as metas já salvas.
      if (dadosCorporais.peso && dadosCorporais.altura) {
        await fitnessApi.updateProfile({
          ...perfil,
          peso: Number(dadosCorporais.peso) || perfil?.peso,
          altura: Number(dadosCorporais.altura) || perfil?.altura,
          idade: Number(dadosCorporais.idade) || perfil?.idade,
          sexo: dadosCorporais.sexo || perfil?.sexo,
          objetivo: dadosCorporais.objetivo || perfil?.objetivo,
        });

        window.localStorage.setItem(
          'perfil-preferencias-locais',
          JSON.stringify({ ...lerPreferenciasLocais(), nivelAtividade: dadosCorporais.nivelAtividade })
        );
      }

      setMensagem('Metas salvas com sucesso.');
      window.setTimeout(aoFechar, 500);
    } catch (erro) {
      const mensagens = erro?.response?.data?.mensagens;
      setErroEnvio(Array.isArray(mensagens) ? mensagens[0] : 'Não foi possível salvar as metas.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Definição de metas diárias"
      onClick={aoFechar}
    >
      {/* Impede que o clique dentro do cartão feche o modal (stopPropagation). */}
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-800"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="m-0 text-lg font-bold text-slate-800 dark:text-zinc-50">Definição de Metas</h3>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div className="mb-5 flex gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={() => setAba('assistente')}
            className={[
              'flex-1 rounded-xl py-2 text-sm font-bold transition-colors',
              aba === 'assistente'
                ? 'bg-white text-slate-800 shadow dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-slate-500 dark:text-zinc-400',
            ].join(' ')}
          >
            Assistente Inteligente
          </button>
          <button
            type="button"
            onClick={() => setAba('manual')}
            className={[
              'flex-1 rounded-xl py-2 text-sm font-bold transition-colors',
              aba === 'manual'
                ? 'bg-white text-slate-800 shadow dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-slate-500 dark:text-zinc-400',
            ].join(' ')}
          >
            Ajuste Manual
          </button>
        </div>

        {aba === 'assistente' ? (
          <div className="flex flex-col gap-4">
            <p className="m-0 text-sm text-slate-500 dark:text-zinc-400">
              Informe seus dados corporais para calcular as metas ideais pela equação de Mifflin-St Jeor.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                Peso (kg)
                <input
                  type="number"
                  min="0"
                  value={dadosCorporais.peso}
                  onChange={(e) => atualizarDadoCorporal('peso', e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                Altura (cm)
                <input
                  type="number"
                  min="0"
                  value={dadosCorporais.altura}
                  onChange={(e) => atualizarDadoCorporal('altura', e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                Idade
                <input
                  type="number"
                  min="0"
                  value={dadosCorporais.idade}
                  onChange={(e) => atualizarDadoCorporal('idade', e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                Sexo biológico
                <select
                  value={dadosCorporais.sexo}
                  onChange={(e) => atualizarDadoCorporal('sexo', e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
              Nível de atividade física
              <select
                value={dadosCorporais.nivelAtividade}
                onChange={(e) => atualizarDadoCorporal('nivelAtividade', e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
              >
                <option value="">Selecione</option>
                {NIVEIS_ATIVIDADE.map((nivel) => (
                  <option key={nivel.valor} value={nivel.valor}>
                    {nivel.titulo}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
              Objetivo
              <select
                value={dadosCorporais.objetivo}
                onChange={(e) => atualizarDadoCorporal('objetivo', e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100"
              >
                <option value="">Selecione</option>
                {OBJETIVOS.map((objetivo) => (
                  <option key={objetivo.valor} value={objetivo.valor}>
                    {objetivo.titulo}
                  </option>
                ))}
              </select>
            </label>

            {erroCalculo && <span className="text-xs font-medium text-rose-500">{erroCalculo}</span>}

            <button
              type="button"
              onClick={gerarMetasAutomaticamente}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles size={16} strokeWidth={2.5} />
              Gerar Metas Automaticamente
            </button>
          </div>
        ) : (
          <form onSubmit={lidarComEnvio} noValidate className="flex flex-col gap-4">
            {resultadoCalculo && (
              <div className="flex items-start gap-2 rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                <Info size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" />
                <p className="m-0 text-xs leading-relaxed">
                  Sua Taxa Metabólica Basal (TMB) é de <strong>{resultadoCalculo.tmb} kcal/dia</strong> — a energia que
                  seu corpo gasta em repouso. Considerando seu nível de atividade, seu gasto energético total estimado
                  é de <strong>{resultadoCalculo.gastoEnergeticoTotal} kcal/dia</strong>. As metas abaixo já aplicam o
                  ajuste do seu objetivo e continuam livres para edição.
                </p>
              </div>
            )}

            {CAMPOS_DO_FORMULARIO.map(({ chave, rotulo, unidade, max }) => (
              <label key={chave} className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                {rotulo} ({unidade})
                <input
                  type="number"
                  min="0"
                  max={max}
                  value={rascunho[chave]}
                  onChange={(evento) => atualizarCampo(chave, evento.target.value)}
                  aria-invalid={Boolean(erros[chave])}
                  aria-describedby={erros[chave] ? `erro-meta-${chave}` : undefined}
                  className={[
                    'rounded-xl border bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-shadow focus:ring-4 dark:bg-zinc-900/40 dark:text-zinc-100',
                    erros[chave]
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-lime-400 focus:ring-lime-100 dark:border-zinc-700',
                  ].join(' ')}
                />
                {erros[chave] && (
                  <span id={`erro-meta-${chave}`} className="text-xs font-medium text-rose-500">
                    {erros[chave]}
                  </span>
                )}
              </label>
            ))}

            {erroEnvio && <p className="m-0 text-xs font-bold text-rose-500">{erroEnvio}</p>}
            {mensagem && <p className="m-0 text-xs font-bold text-emerald-600">{mensagem}</p>}

            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] dark:bg-lime-400 dark:text-zinc-900"
              >
                {salvando ? 'Salvando...' : 'Salvar metas'}
              </button>
              <button
                type="button"
                onClick={aoFechar}
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
