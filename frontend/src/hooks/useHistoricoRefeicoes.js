import { useCallback, useEffect, useState } from 'react';
import { fitnessApi } from '../services/fitnessApi';
import { useNutrition } from '../context/NutritionContext';
import { formatarDataISO } from '../pages/Dashboard/Dieta/utils/calendario';

/**
 * CORREÇÃO DE CAUSA RAIZ (P2.9 / P2.11 e a integridade geral de Relatórios,
 * "Calorias dos últimos 7 dias" e a sequência de dias da Home):
 *
 * `resumoSemanal.js`, `historicoDiario.js`, `sequenciaDias.js` e
 * `agregarRelatorio.js` liam refeições de uma chave de localStorage
 * ('dieta-refeicoes') que `useRefeicoes` — desde que passou a consumir a
 * API real do Spring Boot — nunca mais escreve. O resultado prático: esses
 * quatro lugares mostravam dados zerados para qualquer dia recente (porque
 * nada grava mais naquela chave) enquanto, coincidentemente, dias antigos
 * ainda podiam ter sobras de uma versão anterior do app que gravava ali —
 * exatamente o sintoma relatado no card "Calorias dos últimos 7 dias": o
 * badge do cabeçalho (hoje) em "0 kcal" mas o gráfico com um pico real em
 * outro dia.
 *
 * Este hook busca os dados de verdade, direto do backend, para os últimos
 * `dias` dias (a API só expõe um endpoint por dia — `GET /refeicoes/dia` —
 * então paralelizamos com `Promise.all`; não existe endpoint de intervalo).
 * Falha em um dia isolado não derruba os demais: cada request tem seu
 * próprio fallback para `[]`, e só reportamos `erro` se TODAS falharem.
 */
export function useHistoricoRefeicoes(dias) {
  const { revisaoRefeicoes } = useNutrition();
  const [refeicoesPorDia, setRefeicoesPorDia] = useState(new Map());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const hoje = new Date();
    const isos = Array.from({ length: dias }, (_, indice) => {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - indice);
      return formatarDataISO(data);
    });

    let falhas = 0;
    const resultados = await Promise.all(
      isos.map(async (iso) => {
        try {
          const refeicoesDoDia = await fitnessApi.buscarRefeicoesDoDia(iso);
          return refeicoesDoDia || [];
        } catch (erroDoDia) {
          falhas += 1;
          console.error(`Erro ao buscar refeições de ${iso}:`, erroDoDia);
          return [];
        }
      })
    );

    const mapa = new Map();
    isos.forEach((iso, indice) => mapa.set(iso, resultados[indice]));
    setRefeicoesPorDia(mapa);

    if (falhas === isos.length) {
      setErro('Não foi possível carregar o histórico de refeições.');
    }
    setCarregando(false);
  }, [dias]);

  useEffect(() => {
    carregar();
  }, [carregar, revisaoRefeicoes]);

  return { refeicoesPorDia, carregando, erro, recarregar: carregar };
}
