import { useEffect, useMemo, useState, useCallback } from 'react';
import { somarMacrosDeAlimentos } from '../utils/macros'; // Ajuste o caminho se necessário
import { fitnessApi } from '../../../../services/fitnessApi'; // Ajuste o caminho se necessário

// CORREÇÃO (causa raiz do 405/"alimentos/undefined" ao adicionar o 1º
// alimento do dia): estas refeições padrão só existem no React — id 1/2/3
// são apenas chaves de UI, não IDs reais gerados pelo banco. Antes desta
// correção, adicionar um alimento numa delas disparava direto um
// POST /refeicoes/{1,2,3}/alimentos, que falha com 404 "Refeição não
// encontrada" (ou, pior, grava o alimento numa Refeição de outro dia/usuário
// que por coincidência já tenha esse mesmo ID). `persistida: false` sinaliza
// para `adicionarAlimento`/`adicionarRefeicao` que a Refeição precisa ser
// criada de verdade no backend (POST /refeicoes) antes de qualquer alimento
// poder ser associado a ela.
const criarRefeicoesIniciais = (dataISO) => [
  { id: 1, nome: 'Café da manhã', horario: '08:00', data: dataISO, alimentos: [], persistida: false },
  { id: 2, nome: 'Almoço', horario: '13:00', data: dataISO, alimentos: [], persistida: false },
  { id: 3, nome: 'Lanche', horario: '16:30', data: dataISO, alimentos: [], persistida: false },
];

export function useRefeicoes(dataSelecionadaISO) {
  const [refeicoesDoDia, setRefeicoesDoDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarRefeicoes = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const dadosBD = await fitnessApi.buscarRefeicoesDoDia(dataSelecionadaISO);
      
      if (!dadosBD || dadosBD.length === 0) {
        setRefeicoesDoDia(criarRefeicoesIniciais(dataSelecionadaISO));
      } else {
        // Toda Refeição que já veio do banco obviamente já está persistida.
        setRefeicoesDoDia(dadosBD.map((refeicao) => ({ ...refeicao, persistida: true })));
      }
    } catch (err) {
      console.error("Erro ao buscar refeições da API:", err);
      setErro("Não foi possível carregar as refeições do dia.");
      setRefeicoesDoDia(criarRefeicoesIniciais(dataSelecionadaISO)); 
    } finally {
      setLoading(false);
    }
  }, [dataSelecionadaISO]);

  useEffect(() => {
    carregarRefeicoes();
  }, [carregarRefeicoes]);

  const adicionarAlimento = async (idRefeicao, novoAlimento) => {
    try {
      const refeicaoAlvo = refeicoesDoDia.find((refeicao) => refeicao.id === idRefeicao);
      let idRefeicaoReal = idRefeicao;

      // CORREÇÃO: se a Refeição ainda é só um rascunho local (uma das 3
      // refeições padrão do dia vazio, ou uma "Nova refeição" que o usuário
      // acabou de nomear), ela precisa existir de verdade no banco antes de
      // podermos pendurar um Alimento nela — senão o POST
      // /refeicoes/{id}/alimentos aponta para um ID que o backend nunca viu.
      if (refeicaoAlvo && refeicaoAlvo.persistida === false) {
        const refeicaoCriada = await fitnessApi.criarRefeicao({
          nome: refeicaoAlvo.nome,
          horario: refeicaoAlvo.horario,
          data: dataSelecionadaISO,
        });
        idRefeicaoReal = refeicaoCriada.id;

        setRefeicoesDoDia((prev) =>
          prev.map((refeicao) =>
            refeicao.id === idRefeicao ? { ...refeicaoCriada, alimentos: [], persistida: true } : refeicao
          )
        );
      }

      const alimentoSalvo = await fitnessApi.adicionarAlimento(idRefeicaoReal, novoAlimento);
      setRefeicoesDoDia((prev) =>
        prev.map((refeicao) =>
          refeicao.id === idRefeicaoReal
            ? { ...refeicao, alimentos: [...(refeicao.alimentos || []), alimentoSalvo] }
            : refeicao
        )
      );

      // Devolve o id real (pode diferir do rascunho local) para quem chamou
      // — ex: PainelDieta usa isso para manter a refeição certa expandida.
      return idRefeicaoReal;
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      return idRefeicao;
    }
  };

  const removerAlimento = async (idRefeicao, idAlimento) => {
    try {
      await fitnessApi.removerAlimento(idRefeicao, idAlimento);
      setRefeicoesDoDia((prev) =>
        prev.map((refeicao) =>
          refeicao.id === idRefeicao
            ? { ...refeicao, alimentos: refeicao.alimentos.filter((a) => a.id !== idAlimento) }
            : refeicao
        )
      );
    } catch (err) {
      console.error("Erro ao remover:", err);
    }
  };

  const editarAlimento = async (idRefeicao, idAlimento, alimentoEditado) => {
    try {
      const alimentoAtualizado = await fitnessApi.atualizarAlimento(idRefeicao, idAlimento, alimentoEditado);
      setRefeicoesDoDia((prev) =>
        prev.map((refeicao) =>
          refeicao.id === idRefeicao
            ? {
                ...refeicao,
                alimentos: refeicao.alimentos.map((a) =>
                  a.id === idAlimento ? alimentoAtualizado : a
                ),
              }
            : refeicao
        )
      );
    } catch (err) {
      console.error("Erro ao editar:", err);
    }
  };

  const adicionarRefeicao = async (novaRefeicao) => {
    try {
      // CORREÇÃO: antes, esta função só empurrava a refeição pro estado
      // local do React (com um `id: Date.now()` fabricado no
      // FormularioNovaRefeicao) e nunca chamava o backend — a refeição
      // "existia" só na tela. Qualquer alimento adicionado a ela depois
      // falhava, pois o ID nunca tinha sido criado de verdade via
      // POST /refeicoes.
      const refeicaoCriada = await fitnessApi.criarRefeicao({
        nome: novaRefeicao.nome,
        horario: novaRefeicao.horario,
        data: dataSelecionadaISO,
      });
      setRefeicoesDoDia((prev) => [{ ...refeicaoCriada, persistida: true }, ...prev]);
    } catch (err) {
      console.error("Erro ao criar refeição:", err);
    }
  };

  // 🛡️ CORREÇÃO DOS NÚMEROS INFINITOS NOS TOTAIS DO DIA
  const totaisDoDia = useMemo(() => {
    const soma = refeicoesDoDia.reduce(
      (acumulado, refeicao) => {
        const macrosDaRefeicao = somarMacrosDeAlimentos(refeicao.alimentos || []);
        return {
          calorias: acumulado.calorias + macrosDaRefeicao.calorias,
          proteina: acumulado.proteina + macrosDaRefeicao.proteina,
          carboidratos: acumulado.carboidratos + macrosDaRefeicao.carboidratos,
          gordura: acumulado.gordura + macrosDaRefeicao.gordura,
        };
      },
      { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 }
    );

    return {
      calorias: Math.round(soma.calorias),
      proteina: parseFloat(Number(soma.proteina).toFixed(1)),
      carboidratos: parseFloat(Number(soma.carboidratos).toFixed(1)),
      gordura: parseFloat(Number(soma.gordura).toFixed(1)),
    };
  }, [refeicoesDoDia]);

  return {
    refeicoesDoDia, totaisDoDia, loading, erro,
    adicionarAlimento, removerAlimento, editarAlimento, adicionarRefeicao,
  };
}