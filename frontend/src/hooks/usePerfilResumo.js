import { useCallback, useEffect, useMemo, useState } from 'react';
import { fitnessApi } from '../services/fitnessApi';
import { obterDataDeHojeISO } from '../pages/Dashboard/Dieta/utils/calendario';
import { calcularImc, classificarImc, normalizarAlturaCm } from '../utils/imc';
import { obterUltimoRegistroPeso, ordenarPesosPorData } from '../utils/historicoPeso';

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

function ordenarPorData(lista) {
  return ordenarPesosPorData(lista);
}

/**
 * Hook compartilhado (usado pela Home, Dieta e Evolução) que busca o perfil
 * real do usuário e deriva IMC/histórico de peso. O histórico agora vem do
 * backend (`/evolucao/pesos`); o localStorage fica só como fallback de
 * compatibilidade para bases antigas ou indisponibilidade temporária da API.
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

        let dadosPerfil = resposta.data || {};

        // CORREÇÃO (migração de dados existentes): registros antigos podem
        // ter a altura salva em metros (ex: "1.8") no campo que hoje é
        // sempre tratado como centímetros — sintoma visível era o IMC
        // vindo um número absurdo ou `null` (barrado pela trava em
        // `calcularImc`). Detectamos e corrigimos aqui, na única leitura de
        // perfil compartilhada por Home/Dieta/Evolução, e persistimos a
        // correção de volta no backend (silenciosamente, sem exigir que o
        // usuário abra o formulário de Perfil e resalve) para o dado errado
        // não continuar se propagando.
        const alturaNormalizada = normalizarAlturaCm(dadosPerfil.altura);
        if (alturaNormalizada !== null && alturaNormalizada !== Number(dadosPerfil.altura)) {
          dadosPerfil = { ...dadosPerfil, altura: alturaNormalizada };
          fitnessApi
            .updateProfile({ ...dadosPerfil, altura: alturaNormalizada })
            .catch((erroMigracao) =>
              console.error('Falha ao migrar altura salva em metros para cm:', erroMigracao)
            );
        }

        const pesoAtual = Number(dadosPerfil.peso);
        let pesosBackend = [];

        try {
          pesosBackend = await fitnessApi.listarPesos();
        } catch (erroHistorico) {
          console.error('Falha ao carregar histórico de peso do backend:', erroHistorico);
          pesosBackend = lerHistoricoPesoSalvo();
        }

        if (pesoAtual > 0 && pesosBackend.length === 0) {
          const hojeISO = obterDataDeHojeISO();
          try {
            const registroCriado = await fitnessApi.criarPeso({ data: hojeISO, peso: pesoAtual });
            pesosBackend = [registroCriado];
          } catch (erroRegistroPeso) {
            console.error('Falha ao registrar peso atual no backend:', erroRegistroPeso);
            pesosBackend = [{ data: hojeISO, peso: pesoAtual }];
          }
        }

        const historicoOrdenado = ordenarPesosPorData(pesosBackend).slice(-MAXIMO_PONTOS_HISTORICO);
        const ultimoPeso = obterUltimoRegistroPeso(historicoOrdenado);
        setPerfil(ultimoPeso ? { ...dadosPerfil, peso: Number(ultimoPeso.peso) } : dadosPerfil);
        if (pesosBackend.length > 0) {
          setHistoricoPeso(historicoOrdenado);
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

  const registrarPeso = useCallback(async ({ data = obterDataDeHojeISO(), peso }) => {
    const pesoNumero = Number(peso);
    if (!Number.isFinite(pesoNumero) || pesoNumero < 20 || pesoNumero > 300) {
      throw new Error('Peso deve estar entre 20 e 300 kg.');
    }

    const registro = await fitnessApi.criarPeso({ data, peso: pesoNumero });
    setHistoricoPeso((anterior) => {
      const semMesmoDia = anterior.filter((ponto) => ponto.data !== registro.data);
      return ordenarPorData([...semMesmoDia, registro]).slice(-MAXIMO_PONTOS_HISTORICO);
    });
    setPerfil((atual) => (atual ? { ...atual, peso: pesoNumero } : atual));
    return registro;
  }, []);

  return {
    perfil,
    carregando,
    imc,
    classificacaoImc: classificarImc(imc),
    historicoPeso,
    variacaoPeso,
    registrarPeso,
  };
}
