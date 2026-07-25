import { useEffect, useMemo, useState, useCallback } from 'react';
import { somarMacrosDeAlimentos } from '../utils/macros'; // Ajuste o caminho se necessário
import { fitnessApi } from '../../../../services/fitnessApi'; // Ajuste o caminho se necessário

const criarRefeicoesIniciais = (dataISO) => [
  { id: 1, nome: 'Café da manhã', horario: '08:00', data: dataISO, alimentos: [] },
  { id: 2, nome: 'Almoço', horario: '13:00', data: dataISO, alimentos: [] },
  { id: 3, nome: 'Lanche', horario: '16:30', data: dataISO, alimentos: [] },
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
        setRefeicoesDoDia(dadosBD);
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
      const alimentoSalvo = await fitnessApi.adicionarAlimento(idRefeicao, novoAlimento);
      setRefeicoesDoDia((prev) =>
        prev.map((refeicao) =>
          refeicao.id === idRefeicao
            ? { ...refeicao, alimentos: [...(refeicao.alimentos || []), alimentoSalvo] }
            : refeicao
        )
      );
    } catch (err) {
      console.error("Erro ao adicionar:", err);
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
    setRefeicoesDoDia((prev) => [{ ...novaRefeicao, data: dataSelecionadaISO }, ...prev]);
  };

  // 🛡️ CORREÇÃO DEFINITIVA DOS NÚMEROS INFINITOS NOS TOTAIS DO DIA
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