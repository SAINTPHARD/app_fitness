import { useEffect, useState } from 'react';
import { Drumstick, Flame, Pencil, Plus, Salad, Wheat, Droplet as DropletIcon } from 'lucide-react';
import BarraCalendario from './components/BarraCalendario';
import ModalMetas from './components/ModalMetas';
import CartaoMetaDiaria from './components/CartaoMetaDiaria';
import WidgetHidratacao from './components/WidgetHidratacao';
import CartaoMetricaMacro from './components/CartaoMetricaMacro';
import CartaoProximaRefeicao from './components/CartaoProximaRefeicao';
import CartaoPesoAtual from './components/CartaoPesoAtual';
import IndicadorImc from './components/IndicadorImc';
import CartaoRefeicao from './components/CartaoRefeicao';
import FormularioNovaRefeicao from './components/FormularioNovaRefeicao';
import BotaoFlutuanteNovaRefeicao from './components/BotaoFlutuanteNovaRefeicao';
import ResumoNutricional from './components/ResumoNutricional';
import DistribuicaoMacronutrientes from './components/DistribuicaoMacronutrientes';
import GraficoCaloriasSemanais from './components/GraficoCaloriasSemanais';
import GraficoEvolucaoPeso from './components/GraficoEvolucaoPeso';
import HistoricoTabela from './components/HistoricoTabela';
import EsqueletoPainel from './components/EsqueletoPainel';
import { useMetas } from './hooks/useMetas';
import { useRefeicoes } from './hooks/useRefeicoes';
import { usePerfilResumo } from '../../../hooks/usePerfilResumo';
import { obterDataDeHojeISO } from './utils/calendario';
import { obterProximaRefeicao } from './utils/proximaRefeicao';
import { calcularPercentual, metaExcedida } from './utils/progresso';

export default function PainelDieta() {
  // `pronto` só vira `true` depois do primeiro efeito no cliente. Isso evita
  // renderizar o painel "zerado" por uma fração de segundo antes dos hooks
  // terminarem de ler localStorage (blindagem de UI contra flash de conteúdo).
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    setPronto(true);
  }, []);

  const [dataSelecionadaISO, setDataSelecionadaISO] = useState(obterDataDeHojeISO);
  const [modalMetasAberto, setModalMetasAberto] = useState(false);
  const [criandoRefeicao, setCriandoRefeicao] = useState(false);
  const [refeicaoExpandidaId, setRefeicaoExpandidaId] = useState(null);

  const { metas, atualizarMetas } = useMetas();
  const { refeicoesDoDia, totaisDoDia, adicionarAlimento, removerAlimento, editarAlimento, adicionarRefeicao } =
    useRefeicoes(dataSelecionadaISO);
  const { perfil, imc, classificacaoImc, historicoPeso, variacaoPeso } = usePerfilResumo();

  const proximaRefeicao = obterProximaRefeicao(refeicoesDoDia);

  const lidarComAdicaoDeAlimento = async (idRefeicao, novoAlimento) => {
    // CORREÇÃO: `adicionarAlimento` agora pode criar a Refeição no backend
    // sob demanda (quando ela ainda era só um rascunho local) e o ID real
    // devolvido pelo banco pode diferir do ID local passado aqui — por isso
    // aguardamos o retorno em vez de expandir o ID antigo, que deixaria de
    // bater com `refeicao.id` depois da troca e faria o cartão fechar sozinho.
    const idRefeicaoReal = await adicionarAlimento(idRefeicao, novoAlimento);
    setRefeicaoExpandidaId(idRefeicaoReal);
  };

  const lidarComNovaRefeicao = (novaRefeicao) => {
    adicionarRefeicao(novaRefeicao);
    setCriandoRefeicao(false);
  };

  const alternarExpansao = (idRefeicao) => {
    setRefeicaoExpandidaId((atual) => (atual === idRefeicao ? null : idRefeicao));
  };

  const percentuais = {
    calorias: calcularPercentual(totaisDoDia.calorias, metas.calorias),
    proteina: calcularPercentual(totaisDoDia.proteina, metas.proteinas),
    carboidratos: calcularPercentual(totaisDoDia.carboidratos, metas.carboidratos),
    gordura: calcularPercentual(totaisDoDia.gordura, metas.gorduras),
  };

  // Blindagem de UI: enquanto o cliente não "hidratou" ou se, por algum
  // motivo, um dado essencial vier nulo/indefinido, mostramos o esqueleto em
  // vez de arriscar quebrar o layout com valores ausentes.
  if (!pronto || !metas || !refeicoesDoDia) {
    return <EsqueletoPainel />;
  }

  return (
    <section className="flex flex-col gap-6 pb-20 lg:gap-8">
      {/* Cabeçalho da página: título forte, subtítulo secundário e o botão de metas. */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-2xl font-bold text-slate-800 dark:text-zinc-50 lg:text-3xl">Plano Alimentar</h2>
          <p className="m-0 text-base text-slate-500 dark:text-zinc-400">
            Acompanhe sua alimentação diária, metas nutricionais e hidratação.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalMetasAberto(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-4 py-2.5 text-base font-bold text-zinc-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Pencil size={16} strokeWidth={2.5} />
          Definir meta
        </button>
      </div>

      {/* Barra de calendário semanal: troca o dia exibido em todo o painel. */}
      <BarraCalendario dataSelecionadaISO={dataSelecionadaISO} aoSelecionarDia={setDataSelecionadaISO} />

      {/* Anel colorido com o cálculo automático de quanto ainda resta na
          meta diária de calorias — fica logo no topo do plano alimentar. */}
      <CartaoMetaDiaria meta={metas.calorias || 0} consumido={totaisDoDia.calorias} />

      {/* 4 cartões de macro. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoMetricaMacro
          icone={Flame}
          corIcone="bg-red-100 text-red-500 dark:bg-red-500/10 dark:text-red-300"
          rotulo="Calorias"
          consumido={totaisDoDia.calorias}
          meta={metas.calorias || 0}
          unidade=" kcal"
          percentual={percentuais.calorias}
          alerta={metaExcedida(totaisDoDia.calorias, metas.calorias)}
        />
        <CartaoMetricaMacro
          icone={Drumstick}
          corIcone="bg-blue-100 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300"
          rotulo="Proteínas"
          consumido={`${totaisDoDia.proteina}g`}
          meta={metas.proteinas || 0}
          unidade="g"
          percentual={percentuais.proteina}
          alerta={metaExcedida(totaisDoDia.proteina, metas.proteinas)}
        />
        <CartaoMetricaMacro
          icone={Wheat}
          corIcone="bg-amber-100 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300"
          rotulo="Carboidratos"
          consumido={`${totaisDoDia.carboidratos}g`}
          meta={metas.carboidratos || 0}
          unidade="g"
          percentual={percentuais.carboidratos}
          alerta={metaExcedida(totaisDoDia.carboidratos, metas.carboidratos)}
        />
        <CartaoMetricaMacro
          icone={DropletIcon}
          corIcone="bg-pink-100 text-pink-500 dark:bg-pink-500/10 dark:text-pink-300"
          rotulo="Gorduras"
          consumido={`${totaisDoDia.gordura}g`}
          meta={metas.gorduras || 0}
          unidade="g"
          percentual={percentuais.gordura}
          alerta={metaExcedida(totaisDoDia.gordura, metas.gorduras)}
        />
      </div>

      {/* Água, próxima refeição, e peso+IMC empilhados na terceira coluna. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <WidgetHidratacao dataSelecionadaISO={dataSelecionadaISO} />
        <CartaoProximaRefeicao refeicao={proximaRefeicao} />
        <div className="flex flex-col gap-6">
          <CartaoPesoAtual peso={perfil?.peso} historicoPeso={historicoPeso} variacaoPeso={variacaoPeso} />
          <IndicadorImc imc={imc} classificacao={classificacaoImc} />
        </div>
      </div>

      {/* Refeições do dia (accordion) + resumo nutricional/distribuição de macros. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h3 className="m-0 text-xl font-bold text-slate-800 dark:text-zinc-50">Refeições do dia</h3>

          {criandoRefeicao && (
            <FormularioNovaRefeicao aoAdicionarRefeicao={lidarComNovaRefeicao} aoCancelar={() => setCriandoRefeicao(false)} />
          )}

          {refeicoesDoDia.length > 0 ? (
            <div className="flex flex-col gap-3">
              {refeicoesDoDia.map((refeicao) => (
                <CartaoRefeicao
                  key={refeicao.id}
                  refeicao={refeicao}
                  metas={metas}
                  expandida={refeicaoExpandidaId === refeicao.id}
                  aoAlternarExpandida={() => alternarExpansao(refeicao.id)}
                  aoAdicionarAlimento={lidarComAdicaoDeAlimento}
                  aoRemoverAlimento={removerAlimento}
                  aoEditarAlimento={editarAlimento}
                />
              ))}
            </div>
          ) : (
            // Empty state orientativo: explica o benefício de registrar e já
            // oferece a ação direta, em vez de só uma frase vazia.
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:bg-zinc-800 dark:shadow-none">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-600 dark:bg-lime-400/10 dark:text-lime-300">
                <Salad size={22} strokeWidth={2} />
              </span>
              <p className="m-0 max-w-xs text-sm text-slate-500 dark:text-zinc-400">
                Nenhuma refeição registrada para este dia. Comece agora para acompanhar suas calorias e macros em tempo real.
              </p>
              <button
                type="button"
                onClick={() => setCriandoRefeicao(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={15} strokeWidth={2.5} /> Adicionar refeição
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <ResumoNutricional totais={totaisDoDia} metas={metas} percentuais={percentuais} />
          <DistribuicaoMacronutrientes totais={totaisDoDia} />
        </div>
      </div>

      {/* Gráficos: tendência semanal de calorias e evolução do peso. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <GraficoCaloriasSemanais />
        <GraficoEvolucaoPeso historicoPeso={historicoPeso} />
      </div>

      <HistoricoTabela historicoPeso={historicoPeso} />

      <BotaoFlutuanteNovaRefeicao aberto={criandoRefeicao} aoAlternar={() => setCriandoRefeicao((prev) => !prev)} />

      <ModalMetas
        aberto={modalMetasAberto}
        metasAtuais={metas}
        aoFechar={() => setModalMetasAberto(false)}
        aoSalvar={atualizarMetas}
      />
    </section>
  );
}
