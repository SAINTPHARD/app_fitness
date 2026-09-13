import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { refeicoesService } from '../services/dominio/refeicoesService';
import { hidratacaoService } from '../services/dominio/hidratacaoService';
import { useBloqueioMutacao } from '../hooks/useBloqueioMutacao';
import { mapearErroApi } from '../utils/erroApi';
import { NutritionContext } from './nutritionContextBase';
import { somarMacrosDeAlimentos, validarValoresAlimento } from '../pages/Dashboard/Dieta/utils/macros';
import { obterDataDeHojeISO } from '../pages/Dashboard/Dieta/utils/calendario';
import { ordenarPorHorario } from '../pages/Dashboard/Dieta/utils/proximaRefeicao';

const CHAVE_HIDRATACAO = 'dieta-hidratacao';
const CHAVE_META_ML = 'dieta-meta-agua-ml';
const META_ML_PADRAO = 2000;
const ML_POR_COPO = 250;

const criarRefeicoesIniciais = (dataISO) => [
  { id: 1, nome: 'Café da manhã', horario: '08:00', data: dataISO, alimentos: [], status: 'PENDENTE', persistida: false },
  { id: 2, nome: 'Almoço', horario: '13:00', data: dataISO, alimentos: [], status: 'PENDENTE', persistida: false },
  { id: 3, nome: 'Lanche', horario: '16:30', data: dataISO, alimentos: [], status: 'PENDENTE', persistida: false },
];

function lerJsonLocalStorage(chave, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const valor = window.localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : fallback;
  } catch {
    return fallback;
  }
}

function lerMetaMlSalva() {
  if (typeof window === 'undefined') return META_ML_PADRAO;

  const numero = Number(window.localStorage.getItem(CHAVE_META_ML));
  return numero > 0 ? numero : META_ML_PADRAO;
}

function arredondar1Casa(valor) {
  return Number((Number(valor) || 0).toFixed(1));
}

function calcularTotaisDoDia(refeicoes = []) {
  const soma = refeicoes.reduce(
    (acumulado, refeicao) => {
      const macros = somarMacrosDeAlimentos(refeicao.alimentos || []);
      return {
        calorias: acumulado.calorias + macros.calorias,
        proteina: acumulado.proteina + macros.proteina,
        carboidratos: acumulado.carboidratos + macros.carboidratos,
        gordura: acumulado.gordura + macros.gordura,
      };
    },
    { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 }
  );

  return {
    calorias: Math.round(soma.calorias),
    proteina: arredondar1Casa(soma.proteina),
    carboidratos: arredondar1Casa(soma.carboidratos),
    gordura: arredondar1Casa(soma.gordura),
  };
}

export function NutritionProvider({ children }) {
  const executarComBloqueio = useBloqueioMutacao();
  const [refeicoesPorData, setRefeicoesPorData] = useState({});
  const [statusPorData, setStatusPorData] = useState({});
  const [revisaoRefeicoes, setRevisaoRefeicoes] = useState(0);
  const [aguaPorData, setAguaPorData] = useState({});
  const [statusAguaPorData, setStatusAguaPorData] = useState({});
  const [hidratacaoPorData, setHidratacaoPorData] = useState(() => lerJsonLocalStorage(CHAVE_HIDRATACAO, {}));
  const [metaMl, setMetaMl] = useState(lerMetaMlSalva);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_HIDRATACAO, JSON.stringify(hidratacaoPorData));
  }, [hidratacaoPorData]);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_META_ML, String(metaMl));
  }, [metaMl]);

  const salvarRefeicoesNaData = useCallback((dataISO, refeicoes) => {
    setRefeicoesPorData((prev) => ({
      ...prev,
      [dataISO]: ordenarPorHorario(refeicoes).map((refeicao) => ({
        ...refeicao,
        persistida: refeicao.persistida ?? true,
      })),
    }));
  }, []);

  const invalidarHistoricosRefeicoes = useCallback(() => {
    setRevisaoRefeicoes((versaoAtual) => versaoAtual + 1);
  }, []);

  const carregarRefeicoes = useCallback(
    async (dataISO = obterDataDeHojeISO(), { forcar = false } = {}) => {
      if (!forcar && refeicoesPorData[dataISO]) return refeicoesPorData[dataISO];

      setStatusPorData((prev) => ({ ...prev, [dataISO]: { loading: true, erro: null } }));

      try {
        const dadosBD = await refeicoesService.listarDoDia(dataISO);
        const refeicoes = dadosBD?.length
          ? dadosBD.map((refeicao) => ({ ...refeicao, persistida: true }))
          : criarRefeicoesIniciais(dataISO);

        salvarRefeicoesNaData(dataISO, refeicoes);
        setStatusPorData((prev) => ({ ...prev, [dataISO]: { loading: false, erro: null } }));
        return refeicoes;
      } catch (err) {
        console.error('Erro ao buscar refeições da API:', err);
        const fallback = criarRefeicoesIniciais(dataISO);
        salvarRefeicoesNaData(dataISO, fallback);
        setStatusPorData((prev) => ({
          ...prev,
          [dataISO]: { loading: false, erro: mapearErroApi(err, 'carregar as refeições').mensagem },
        }));
        return fallback;
      }
    },
    [refeicoesPorData, salvarRefeicoesNaData]
  );

  const obterRefeicoesDaData = useCallback(
    (dataISO) => refeicoesPorData[dataISO] || criarRefeicoesIniciais(dataISO),
    [refeicoesPorData]
  );

  const substituirRefeicaoNaData = useCallback((dataISO, idRefeicao, atualizar) => {
    setRefeicoesPorData((prev) => {
      const refeicoes = prev[dataISO] || criarRefeicoesIniciais(dataISO);
      return {
        ...prev,
        [dataISO]: ordenarPorHorario(
          refeicoes.map((refeicao) => (refeicao.id === idRefeicao ? atualizar(refeicao) : refeicao))
        ),
      };
    });
  }, []);

  const adicionarRefeicao = useCallback(async (dataISO, novaRefeicao) => {
    const refeicaoCriada = await executarComBloqueio(`criar-refeicao:${dataISO}:${novaRefeicao.nome}:${novaRefeicao.horario}`, () => refeicoesService.criar({
      nome: novaRefeicao.nome,
      horario: novaRefeicao.horario,
      data: dataISO,
    }));
    if (!refeicaoCriada) return undefined;

    setRefeicoesPorData((prev) => ({
      ...prev,
      [dataISO]: ordenarPorHorario([{ ...refeicaoCriada, persistida: true }, ...(prev[dataISO] || [])]),
    }));
    invalidarHistoricosRefeicoes();

    return refeicaoCriada;
  }, [executarComBloqueio, invalidarHistoricosRefeicoes]);

  const editarRefeicao = useCallback(async (dataISO, idRefeicao, dadosRefeicao) => {
    const refeicaoAtualizada = await refeicoesService.atualizar(idRefeicao, {
      ...dadosRefeicao,
      data: dadosRefeicao.data || dataISO,
    });

    substituirRefeicaoNaData(dataISO, idRefeicao, () => ({ ...refeicaoAtualizada, persistida: true }));
    invalidarHistoricosRefeicoes();
    return refeicaoAtualizada;
  }, [invalidarHistoricosRefeicoes, substituirRefeicaoNaData]);

  const removerRefeicao = useCallback(async (dataISO, idRefeicao) => {
    const refeicoes = obterRefeicoesDaData(dataISO);
    const refeicaoAlvo = refeicoes.find((refeicao) => refeicao.id === idRefeicao);

    if (refeicaoAlvo?.persistida === false) {
      setRefeicoesPorData((prev) => ({
        ...prev,
        [dataISO]: refeicoes.filter((refeicao) => refeicao.id !== idRefeicao),
      }));
      return;
    }

    await refeicoesService.remover(idRefeicao);
    setRefeicoesPorData((prev) => ({
      ...prev,
      [dataISO]: (prev[dataISO] || []).filter((refeicao) => refeicao.id !== idRefeicao),
    }));
    invalidarHistoricosRefeicoes();
  }, [invalidarHistoricosRefeicoes, obterRefeicoesDaData]);

  const garantirRefeicaoPersistida = useCallback(async (dataISO, idRefeicao) => {
    const refeicaoAlvo = obterRefeicoesDaData(dataISO).find((refeicao) => refeicao.id === idRefeicao);
    if (!refeicaoAlvo || refeicaoAlvo.persistida !== false) return idRefeicao;

    const refeicaoCriada = await executarComBloqueio(`persistir-refeicao:${dataISO}:${idRefeicao}`, () => refeicoesService.criar({
      nome: refeicaoAlvo.nome,
      horario: refeicaoAlvo.horario,
      data: dataISO,
    }));
    if (!refeicaoCriada) return idRefeicao;

    substituirRefeicaoNaData(dataISO, idRefeicao, () => ({ ...refeicaoCriada, alimentos: [], persistida: true }));
    return refeicaoCriada.id;
  }, [executarComBloqueio, obterRefeicoesDaData, substituirRefeicaoNaData]);

  const adicionarAlimento = useCallback(async (dataISO, idRefeicao, novoAlimento) => {
    const erroValidacao = validarValoresAlimento(novoAlimento);
    if (erroValidacao) throw new Error(erroValidacao);

    const idRefeicaoReal = await garantirRefeicaoPersistida(dataISO, idRefeicao);
    // O backend agora devolve a Refeição inteira (itens + totalCalorias
    // recalculado), não só o Alimento criado — substituímos a refeição
    // inteira na mesma resposta, em vez de só anexar um item à lista local,
    // então itens antigos + o novo total já vêm garantidamente consistentes
    // com o que o backend persistiu.
    const refeicaoAtualizada = await executarComBloqueio(`adicionar-alimento:${idRefeicaoReal}`, () =>
      refeicoesService.adicionarAlimento(idRefeicaoReal, novoAlimento)
    );
    if (!refeicaoAtualizada) return idRefeicaoReal;

    substituirRefeicaoNaData(dataISO, idRefeicaoReal, () => ({ ...refeicaoAtualizada, persistida: true }));
    invalidarHistoricosRefeicoes();

    return idRefeicaoReal;
  }, [executarComBloqueio, garantirRefeicaoPersistida, invalidarHistoricosRefeicoes, substituirRefeicaoNaData]);

  const editarAlimento = useCallback(async (dataISO, idRefeicao, idAlimento, alimentoEditado) => {
    const erroValidacao = validarValoresAlimento(alimentoEditado);
    if (erroValidacao) throw new Error(erroValidacao);

    const alimentoAtualizado = await refeicoesService.atualizarAlimento(idRefeicao, idAlimento, alimentoEditado);

    substituirRefeicaoNaData(dataISO, idRefeicao, (refeicao) => ({
      ...refeicao,
      alimentos: (refeicao.alimentos || []).map((alimento) =>
        alimento.id === idAlimento ? alimentoAtualizado : alimento
      ),
    }));
    invalidarHistoricosRefeicoes();

    return alimentoAtualizado;
  }, [invalidarHistoricosRefeicoes, substituirRefeicaoNaData]);

  const removerAlimento = useCallback(async (dataISO, idRefeicao, idAlimento) => {
    const refeicaoAtualizada = await refeicoesService.removerAlimento(idRefeicao, idAlimento);

    substituirRefeicaoNaData(dataISO, idRefeicao, (refeicao) => ({
      ...refeicao,
      ...(refeicaoAtualizada || {}),
      alimentos: refeicaoAtualizada?.alimentos || (refeicao.alimentos || []).filter((alimento) => alimento.id !== idAlimento),
    }));
    invalidarHistoricosRefeicoes();
  }, [invalidarHistoricosRefeicoes, substituirRefeicaoNaData]);

  const concluirRefeicao = useCallback(async (dataISO, idRefeicao) => {
    const refeicaoAtualizada = await executarComBloqueio(`concluir-refeicao:${idRefeicao}`, () =>
      refeicoesService.concluir(idRefeicao)
    );
    if (!refeicaoAtualizada) return undefined;
    substituirRefeicaoNaData(dataISO, idRefeicao, (refeicao) => ({ ...refeicao, ...refeicaoAtualizada }));
    invalidarHistoricosRefeicoes();
    return refeicaoAtualizada;
  }, [executarComBloqueio, invalidarHistoricosRefeicoes, substituirRefeicaoNaData]);

  const carregarAgua = useCallback(
    async (dataISO = obterDataDeHojeISO(), { forcar = false } = {}) => {
      if (!forcar && aguaPorData[dataISO]) return aguaPorData[dataISO];

      setStatusAguaPorData((prev) => ({ ...prev, [dataISO]: { loading: true, erro: null } }));

      try {
        const registros = await hidratacaoService.listarDoDia(dataISO);
        setAguaPorData((prev) => ({ ...prev, [dataISO]: registros }));
        setStatusAguaPorData((prev) => ({ ...prev, [dataISO]: { loading: false, erro: null } }));
        return registros;
      } catch (erro) {
        console.error('Erro ao buscar hidratação da API:', erro);
        setStatusAguaPorData((prev) => ({
          ...prev,
          [dataISO]: { loading: false, erro: mapearErroApi(erro, 'carregar o consumo de água').mensagem },
        }));
        return aguaPorData[dataISO] || [];
      }
    },
    [aguaPorData]
  );

  const obterRegistrosAguaDaData = useCallback((dataISO) => aguaPorData[dataISO] || [], [aguaPorData]);

  const adicionarAguaMl = useCallback(async (dataISO, quantidadeMl) => {
    const registro = await executarComBloqueio(`agua:${dataISO}`, () =>
      hidratacaoService.registrar({ data: dataISO, quantidadeMl })
    );
    if (!registro) return undefined;

    setAguaPorData((prev) => ({
      ...prev,
      [dataISO]: [...(prev[dataISO] || []), registro].sort((a, b) =>
        String(a.dataHora || '').localeCompare(String(b.dataHora || ''))
      ),
    }));

    return registro;
  }, [executarComBloqueio]);

  const removerRegistroAgua = useCallback(async (dataISO, idRegistro) => {
    await hidratacaoService.remover(idRegistro);
    setAguaPorData((prev) => ({
      ...prev,
      [dataISO]: (prev[dataISO] || []).filter((registro) => registro.id !== idRegistro),
    }));
  }, []);

  const definirConsumoAguaMl = useCallback((dataISO, novoTotalMl) => {
    const totalMl = Math.max(0, Number(novoTotalMl) || 0);
    setHidratacaoPorData((prev) => ({ ...prev, [dataISO]: Math.round(totalMl / ML_POR_COPO) }));
  }, []);

  const adicionarCopo = useCallback((dataISO) => {
    setHidratacaoPorData((prev) => ({ ...prev, [dataISO]: (prev[dataISO] || 0) + 1 }));
  }, []);

  const alternarCopo = useCallback((dataISO, indiceClicado) => {
    const posicaoClicada = indiceClicado + 1;
    setHidratacaoPorData((prev) => {
      const coposAtuais = prev[dataISO] || 0;
      const novoValor = coposAtuais === posicaoClicada ? posicaoClicada - 1 : posicaoClicada;
      return { ...prev, [dataISO]: novoValor };
    });
  }, []);

  const definirMetaMl = useCallback((novaMetaMl) => {
    const numero = Number(novaMetaMl);
    if (numero > 0) setMetaMl(numero);
  }, []);

  const valor = useMemo(
    () => ({
      carregarRefeicoes,
      revisaoRefeicoes,
      carregarAgua,
      obterRegistrosAguaDaData,
      obterStatusAguaDaData: (dataISO) => statusAguaPorData[dataISO] || { loading: !aguaPorData[dataISO], erro: null },
      adicionarAguaMl,
      removerRegistroAgua,
      obterRefeicoesDaData,
      obterStatusDaData: (dataISO) => statusPorData[dataISO] || { loading: !refeicoesPorData[dataISO], erro: null },
      obterTotaisDaData: (dataISO) => calcularTotaisDoDia(obterRefeicoesDaData(dataISO)),
      adicionarRefeicao,
      editarRefeicao,
      removerRefeicao,
      adicionarAlimento,
      editarAlimento,
      removerAlimento,
      concluirRefeicao,
      hidratacaoPorData,
      metaMl,
      metaCopos: Math.max(1, Math.round(metaMl / ML_POR_COPO)),
      mlPorCopo: ML_POR_COPO,
      adicionarCopo,
      alternarCopo,
      definirConsumoAguaMl,
      definirMetaMl,
    }),
    [
      adicionarAlimento,
      adicionarAguaMl,
      adicionarCopo,
      adicionarRefeicao,
      alternarCopo,
      carregarRefeicoes,
      carregarAgua,
      concluirRefeicao,
      definirConsumoAguaMl,
      definirMetaMl,
      editarAlimento,
      editarRefeicao,
      aguaPorData,
      hidratacaoPorData,
      metaMl,
      obterRefeicoesDaData,
      obterRegistrosAguaDaData,
      refeicoesPorData,
      revisaoRefeicoes,
      removerAlimento,
      removerRegistroAgua,
      removerRefeicao,
      statusAguaPorData,
      statusPorData,
    ]
  );

  return <NutritionContext.Provider value={valor}>{children}</NutritionContext.Provider>;
}

NutritionProvider.propTypes = { children: PropTypes.node.isRequired };
