import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fitnessApi } from '../services/fitnessApi';
import { calcularImc, classificarImc, normalizarAlturaCm } from '../utils/imc';
import { obterUltimoRegistroPeso, ordenarPesosPorData } from '../utils/historicoPeso';
import { mapearErroApi } from '../utils/erroApi';

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
 * Hook compartilhado (usado pela Home, Dieta e Evolução) que busca o perfil
 * real do usuário e deriva IMC/histórico de peso. O histórico agora vem do
 * backend (`/evolucao/pesos`); o localStorage fica só como fallback de
 * compatibilidade para bases antigas ou indisponibilidade temporária da API.
 *
 * A falha de carregamento agora também vira estado (`erro`) e não só um
 * `console.error`: antes, se `/perfil` caísse, a Home renderizava sem badge
 * de objetivo e sem gráfico de peso como se aquilo fosse o estado normal do
 * usuário, sem nenhum aviso nem forma de tentar de novo.
 */
export function usePerfilResumo() {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [historicoPeso, setHistoricoPeso] = useState(lerHistoricoPesoSalvo);
  // Evita `setState` depois que o componente saiu da tela — inclusive quando
  // o recarregamento manual é disparado e o usuário navega antes da resposta.
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_HISTORICO_PESO, JSON.stringify(historicoPeso));
  }, [historicoPeso]);

  const carregarPerfil = useCallback(async () => {
    try {
      const resposta = await fitnessApi.getProfile();
      if (!montadoRef.current) return;

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

      let pesosBackend = [];

      try {
        pesosBackend = await fitnessApi.listarPesos();
      } catch (erroHistorico) {
        console.error('Falha ao carregar histórico de peso do backend:', erroHistorico);
        pesosBackend = lerHistoricoPesoSalvo();
      }

      if (!montadoRef.current) return;

      const historicoOrdenado = ordenarPesosPorData(pesosBackend).slice(-MAXIMO_PONTOS_HISTORICO);
      const ultimoPeso = obterUltimoRegistroPeso(historicoOrdenado);
      setPerfil(ultimoPeso ? { ...dadosPerfil, peso: Number(ultimoPeso.peso) } : dadosPerfil);
      if (pesosBackend.length > 0) {
        setHistoricoPeso(historicoOrdenado);
      }
      setErro(null);
    } catch (falha) {
      console.error('Falha ao carregar o perfil:', falha);
      if (montadoRef.current) setErro(mapearErroApi(falha, 'carregar o seu perfil').mensagem);
    } finally {
      if (montadoRef.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  const recarregar = useCallback(async () => {
    setRecarregando(true);
    try {
      await carregarPerfil();
    } finally {
      if (montadoRef.current) setRecarregando(false);
    }
  }, [carregarPerfil]);

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
    recarregando,
    erro,
    recarregar,
    imc,
    classificacaoImc: classificarImc(imc),
    historicoPeso,
    variacaoPeso,
  };
}
