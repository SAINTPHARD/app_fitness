import { useEffect, useMemo, useState } from 'react';
import { fitnessApi } from '../services/fitnessApi';
import { obterDataDeHojeISO } from '../pages/Dashboard/Dieta/utils/calendario';
import { calcularImc, classificarImc } from '../utils/imc';

const CHAVE_HISTORICO_PESO = 'home-historico-peso';
const MAXIMO_PONTOS_HISTORICO = 30;

function lerHistoricoPesoSalvo() {
  if (typeof window === 'undefined') return [];

  try {
    const salvo = window.localStorage.getItem(CHAVE_HISTORICO_PESO);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

/**
 * Hook compartilhado (usado pela Home e pela Dieta) que busca o perfil real
 * do usuário — o mesmo endpoint `/profile` que a página Perfil já usa — e
 * deriva o IMC. Como o backend ainda não expõe um histórico de peso ao
 * longo do tempo, registramos aqui um ponto por dia (localStorage) sempre
 * que o peso do perfil é lido, para os gráficos de evolução crescerem com
 * dados reais em vez de uma tendência inventada.
 */
export function usePerfilResumo() {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [historicoPeso, setHistoricoPeso] = useState(lerHistoricoPesoSalvo);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_HISTORICO_PESO, JSON.stringify(historicoPeso));
  }, [historicoPeso]);

  useEffect(() => {
    let cancelado = false;

    async function carregarPerfil() {
      try {
        const resposta = await fitnessApi.getProfile();
        if (cancelado) return;

        const dadosPerfil = resposta.data || {};
        setPerfil(dadosPerfil);

        const pesoAtual = Number(dadosPerfil.peso);
        if (pesoAtual > 0) {
          const hojeISO = obterDataDeHojeISO();

          setHistoricoPeso((anterior) => {
            const semRegistroDeHoje = anterior.filter((ponto) => ponto.data !== hojeISO);
            return [...semRegistroDeHoje, { data: hojeISO, peso: pesoAtual }].slice(-MAXIMO_PONTOS_HISTORICO);
          });
        }
      } catch (erro) {
        console.error('Falha ao carregar o perfil:', erro);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarPerfil();

    return () => {
      cancelado = true;
    };
  }, []);

  const imc = useMemo(() => {
    if (!perfil?.peso || !perfil?.altura) return null;
    return calcularImc(perfil.peso, perfil.altura);
  }, [perfil]);

  const variacaoPeso = useMemo(() => {
    if (historicoPeso.length < 2) return null;
    const primeiro = historicoPeso[0].peso;
    const ultimo = historicoPeso[historicoPeso.length - 1].peso;
    return Number((ultimo - primeiro).toFixed(1));
  }, [historicoPeso]);

  return {
    perfil,
    carregando,
    imc,
    classificacaoImc: classificarImc(imc),
    historicoPeso,
    variacaoPeso,
  };
}
