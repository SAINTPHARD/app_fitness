import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft } from 'lucide-react';
import { fitnessApi } from '../../services/fitnessApi';
import { useAuth } from '../../context/AuthContext';
import { obterPrimeiroNome } from '../../utils/nomeUsuario';

const TOTAL_ETAPAS = 4;

// O backend só reconhece estes 3 objetivos (enum `Objetivo` do Spring) — em
// vez de simular uma seleção múltipla de 5 opções que não teria como ser
// persistida, o formulário já nasce alinhado ao que a API aceita de verdade.
const OBJETIVOS = [
  { valor: 'EMAGRECER', titulo: 'Perder peso', descricao: 'Déficit calórico controlado' },
  { valor: 'MANTER', titulo: 'Manter o peso', descricao: 'Equilíbrio entre consumo e gasto' },
  { valor: 'HIPERTROFIA', titulo: 'Ganhar massa muscular', descricao: 'Superávit calórico e treino de força' },
];

// Nível de atividade ainda não existe como campo no backend — guardamos como
// preferência local (mesma estratégia já usada para metas de água/macros na
// Dieta) até o backend ganhar essa coluna.
const NIVEIS_ATIVIDADE = [
  { valor: 'SEDENTARIO', titulo: 'Não muito ativo', descricao: 'Passa a maior parte do dia sentado' },
  { valor: 'LEVE', titulo: 'Levemente ativo', descricao: 'Exercício leve 1 a 3x por semana' },
  { valor: 'ATIVO', titulo: 'Ativo', descricao: 'Exercício moderado 3 a 5x por semana' },
  { valor: 'MUITO_ATIVO', titulo: 'Bastante ativo', descricao: 'Exercício intenso quase todos os dias' },
];

const SEXOS = [
  { valor: 'M', titulo: 'Masculino' },
  { valor: 'F', titulo: 'Feminino' },
];

// Dias da semana para o planejamento de treino — o array de valores (ex:
// ['SEG', 'QUA', 'SEX']) é o mesmo formato que o backend deverá aceitar
// quando ganhar uma coluna própria para isso.
const DIAS_TREINO = [
  { valor: 'SEG', titulo: 'Seg' },
  { valor: 'TER', titulo: 'Ter' },
  { valor: 'QUA', titulo: 'Qua' },
  { valor: 'QUI', titulo: 'Qui' },
  { valor: 'SEX', titulo: 'Sex' },
  { valor: 'SAB', titulo: 'Sáb' },
  { valor: 'DOM', titulo: 'Dom' },
];

const DADOS_INICIAIS = {
  objetivo: '',
  nivelAtividade: '',
  diasTreino: [],
  sexo: '',
  dataNascimento: '',
  pais: '',
  altura: '',
  peso: '',
  pesoAlvo: '',
};

const CLASSES_CAMPO =
  'h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900 outline-none transition ' +
  'placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 ' +
  'disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';

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

/** Aplica a máscara DD/MM/AAAA enquanto o usuário digita (só dígitos, 8 no máximo). */
function aplicarMascaraDataBR(valorDigitado) {
  const digitos = valorDigitado.replace(/\D/g, '').slice(0, 8);
  if (digitos.length > 4) return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
  if (digitos.length > 2) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return digitos;
}

/** Converte "DD/MM/AAAA" para o formato ISO ("YYYY-MM-DD") esperado pelo backend. */
function converterDataBRParaISO(dataBR) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBR || '');
  if (!match) return null;

  const [, dia, mes, ano] = match;
  const iso = `${ano}-${mes}-${dia}`;
  const data = new Date(iso);
  const dataValida =
    !Number.isNaN(data.getTime()) &&
    data.getUTCFullYear() === Number(ano) &&
    data.getUTCMonth() + 1 === Number(mes) &&
    data.getUTCDate() === Number(dia);

  return dataValida ? iso : null;
}

/** Botão de escolha grande, com borda dinâmica ao ser selecionado. */
function OpcaoCartao({ titulo, descricao, selecionado, aoSelecionar }) {
  return (
    <button
      type="button"
      onClick={aoSelecionar}
      aria-pressed={selecionado}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all duration-300 ease-in-out active:scale-[0.98] ${
        selecionado
          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span
          className={`block font-bold ${
            selecionado ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          {titulo}
        </span>
        {descricao && (
          <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">{descricao}</span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
          selecionado
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-zinc-300 text-transparent dark:border-zinc-600'
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </span>
    </button>
  );
}

OpcaoCartao.propTypes = {
  titulo: PropTypes.string.isRequired,
  descricao: PropTypes.string,
  selecionado: PropTypes.bool,
  aoSelecionar: PropTypes.func.isRequired,
};

function Campo({ rotulo, dica, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{rotulo}</span>
      {children}
      {dica && <span className="mt-1.5 block text-xs text-zinc-400">{dica}</span>}
    </label>
  );
}

Campo.propTypes = {
  rotulo: PropTypes.string.isRequired,
  dica: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default function OnboardingPage() {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const navigate = useNavigate();
  const { user, marcarPerfilCompleto } = useAuth();
  const primeiroNome = obterPrimeiroNome(user);

  const percentual = useMemo(() => Math.round((etapa / TOTAL_ETAPAS) * 100), [etapa]);
  const ehUltimaEtapa = etapa === TOTAL_ETAPAS;

  const atualizarCampo = (campo, valor) => {
    setErro('');
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  const alternarDiaTreino = (valorDia) => {
    setErro('');
    setDados((prev) => ({
      ...prev,
      diasTreino: prev.diasTreino.includes(valorDia)
        ? prev.diasTreino.filter((dia) => dia !== valorDia)
        : [...prev.diasTreino, valorDia],
    }));
  };

  const validarEtapa = (numero) => {
    if (numero === 1) return dados.objetivo ? null : 'Escolha um objetivo para continuar.';
    if (numero === 2) return dados.nivelAtividade ? null : 'Escolha o seu nível de atividade.';
    if (numero === 3) {
      if (!dados.sexo) return 'Selecione o sexo biológico usado no cálculo calórico.';
      if (!dados.dataNascimento) return 'Informe a sua data de nascimento.';
      if (calcularIdade(converterDataBRParaISO(dados.dataNascimento)) === null) return 'Data de nascimento inválida.';
      return null;
    }
    if (numero === 4) {
      const altura = Number(dados.altura);
      const peso = Number(dados.peso);
      // Faixas plausíveis (50-250cm, 20-300kg) — sem isso, alguém digitando
      // "1.82" (pensando em metros) num campo de cm passava validação e
      // gerava um IMC absurdo mais adiante.
      if (!(altura >= 50 && altura <= 250)) return 'Altura deve estar entre 50 e 250 cm (1,82 m = 182 cm).';
      if (!(peso >= 20 && peso <= 300)) return 'Peso deve estar entre 20 e 300 kg.';
      return null;
    }
    return null;
  };

  const avancar = () => {
    const problema = validarEtapa(etapa);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro('');
    setEtapa((prev) => prev + 1);
  };

  const voltar = () => {
    setErro('');
    setEtapa((prev) => Math.max(prev - 1, 1));
  };

  const finalizar = async () => {
    const problema = validarEtapa(TOTAL_ETAPAS);
    if (problema) {
      setErro(problema);
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      // Usa a instância Axios do projeto (baseURL de ambiente + token via
      // interceptor). Antes daqui saíam chamadas com `http://localhost:8080`
      // no código — em produção isso nunca funcionaria.
      const { data: perfilAtual } = await fitnessApi.getProfile();

      await fitnessApi.updateMetrics({
        ...perfilAtual,
        peso: Number(dados.peso),
        altura: Number(dados.altura),
        idade: calcularIdade(converterDataBRParaISO(dados.dataNascimento)) ?? perfilAtual?.idade ?? null,
        objetivo: dados.objetivo,
        sexo: dados.sexo || perfilAtual?.sexo || null,
      });

      // Preferências que o backend ainda não tem coluna para guardar.
      // `diasTreino` já nasce no formato de array de siglas (ex: ['SEG',
      // 'QUA', 'SEX']) — é só isso que precisa migrar para o JSON de
      // `updateMetrics`/endpoint próprio quando o backend ganhar essa coluna.
      window.localStorage.setItem(
        'perfil-preferencias-locais',
        JSON.stringify({
          nivelAtividade: dados.nivelAtividade,
          diasTreino: dados.diasTreino,
          pais: dados.pais.trim(),
          pesoAlvo: Number(dados.pesoAlvo) || null,
        }),
      );

      // Estado do React, não só localStorage: é isso que libera a guarda de
      // /dashboard no App e encerra o loop de volta para o passo 1.
      marcarPerfilCompleto();
      navigate('/dashboard/inicio', { replace: true });
    } catch (err) {
      setErro(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Não foi possível salvar seus dados. Tente novamente.',
      );
    } finally {
      setSalvando(false);
    }
  };

  const conteudo = {
    1: {
      titulo: `Vamos começar, ${primeiroNome}.`,
      subtitulo: 'Qual é o seu objetivo principal? Isso ajusta suas metas de calorias e macros.',
      corpo: (
        <div className="flex flex-col gap-3">
          {OBJETIVOS.map((opcao) => (
            <OpcaoCartao
              key={opcao.valor}
              titulo={opcao.titulo}
              descricao={opcao.descricao}
              selecionado={dados.objetivo === opcao.valor}
              aoSelecionar={() => atualizarCampo('objetivo', opcao.valor)}
            />
          ))}
        </div>
      ),
    },
    2: {
      titulo: 'Qual é o seu nível básico de atividade?',
      subtitulo: 'Sem contar os treinos — esses entram separadamente.',
      corpo: (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {NIVEIS_ATIVIDADE.map((opcao) => (
              <OpcaoCartao
                key={opcao.valor}
                titulo={opcao.titulo}
                descricao={opcao.descricao}
                selecionado={dados.nivelAtividade === opcao.valor}
                aoSelecionar={() => atualizarCampo('nivelAtividade', opcao.valor)}
              />
            ))}
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Em quais dias você pretende treinar?
            </legend>
            <p className="mb-3 text-xs text-zinc-400">Opcional — dá para ajustar isso depois.</p>
            <div className="flex flex-wrap gap-2">
              {DIAS_TREINO.map((dia) => {
                const selecionado = dados.diasTreino.includes(dia.valor);
                return (
                  <button
                    key={dia.valor}
                    type="button"
                    onClick={() => alternarDiaTreino(dia.valor)}
                    aria-pressed={selecionado}
                    className={`h-11 min-w-[3.25rem] flex-1 rounded-xl border-2 text-sm font-bold transition-all duration-300 ease-in-out active:scale-95 sm:flex-none sm:px-4 ${
                      selecionado
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {dia.titulo}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      ),
    },
    3: {
      titulo: 'Seus dados pessoais',
      subtitulo: 'Usamos essas informações para calcular uma meta calórica precisa para você.',
      corpo: (
        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Sexo usado no cálculo calórico
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {SEXOS.map((opcao) => (
                <OpcaoCartao
                  key={opcao.valor}
                  titulo={opcao.titulo}
                  selecionado={dados.sexo === opcao.valor}
                  aoSelecionar={() => atualizarCampo('sexo', opcao.valor)}
                />
              ))}
            </div>
          </fieldset>

          <Campo rotulo="Quando você nasceu?">
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD/MM/AAAA"
              maxLength={10}
              value={dados.dataNascimento}
              onChange={(e) => atualizarCampo('dataNascimento', aplicarMascaraDataBR(e.target.value))}
              className={CLASSES_CAMPO}
            />
          </Campo>

          <Campo rotulo="Onde você vive?" dica="Opcional.">
            <input
              type="text"
              placeholder="Brasil"
              value={dados.pais}
              onChange={(e) => atualizarCampo('pais', e.target.value)}
              className={CLASSES_CAMPO}
            />
          </Campo>
        </div>
      ),
    },
    4: {
      titulo: 'Suas métricas corporais',
      subtitulo: 'Pode ser uma estimativa — dá para atualizar depois no Perfil.',
      corpo: (
        <div className="flex flex-col gap-5">
          <Campo rotulo="Qual a sua altura?" dica="Em centímetros. Ex: 1,82 m = 182.">
            <input
              type="number"
              inputMode="numeric"
              min="50"
              max="250"
              step="1"
              placeholder="182"
              value={dados.altura}
              onChange={(e) => atualizarCampo('altura', e.target.value)}
              className={CLASSES_CAMPO}
            />
          </Campo>

          <Campo rotulo="Quanto você pesa hoje?" dica="Em quilogramas.">
            <input
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.1"
              placeholder="78,5"
              value={dados.peso}
              onChange={(e) => atualizarCampo('peso', e.target.value)}
              className={CLASSES_CAMPO}
            />
          </Campo>

          <Campo rotulo="Qual é a sua meta de peso?" dica="Opcional — não altera sua meta diária de calorias.">
            <input
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.1"
              placeholder="72,0"
              value={dados.pesoAlvo}
              onChange={(e) => atualizarCampo('pesoAlvo', e.target.value)}
              className={CLASSES_CAMPO}
            />
          </Campo>
        </div>
      ),
    },
  }[etapa];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:py-10">
      <div className="w-full max-w-lg animate-fade-in overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        {/* Barra de progresso superior, colada na borda do cartão. */}
        <div
          className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={etapa}
          aria-valuemin={1}
          aria-valuemax={TOTAL_ETAPAS}
          aria-label={`Passo ${etapa} de ${TOTAL_ETAPAS}`}
        >
          <div
            className="h-full rounded-r-full bg-emerald-600 transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${percentual}%` }}
          />
        </div>

        <div className="px-6 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-9">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Passo {etapa} de {TOTAL_ETAPAS}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-100">
            {conteudo.titulo}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{conteudo.subtitulo}</p>

          <div key={etapa} className="mt-7 animate-fade-in-up">
            {conteudo.corpo}
          </div>

          {erro && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
            >
              {erro}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800 sm:px-10">
          {etapa > 1 && (
            <button
              type="button"
              onClick={voltar}
              disabled={salvando}
              className="flex h-12 items-center gap-1 rounded-xl border-2 border-zinc-200 px-5 text-sm font-bold text-zinc-700 transition-all duration-300 ease-in-out hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ChevronLeft size={18} strokeWidth={2.5} /> Voltar
            </button>
          )}

          <button
            type="button"
            onClick={ehUltimaEtapa ? finalizar : avancar}
            disabled={salvando}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition-all duration-300 ease-in-out hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
          >
            {salvando && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {salvando ? 'Salvando seu perfil…' : ehUltimaEtapa ? 'Concluir e ir para o painel' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
