import { useEffect, useState } from 'react';

const CHAVE_ARMAZENAMENTO = 'dieta-hidratacao';
const CHAVE_META_ML = 'dieta-meta-agua-ml';
const META_ML_PADRAO = 2000; // 2L/dia por padrão, até o usuário definir a própria meta.
const ML_POR_COPO = 250;

function lerRegistrosSalvos() {
  if (typeof window === 'undefined') return {};

  try {
    const registrosSalvos = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    return registrosSalvos ? JSON.parse(registrosSalvos) : {};
  } catch {
    return {};
  }
}

function lerMetaMlSalva() {
  if (typeof window === 'undefined') return META_ML_PADRAO;

  try {
    const salva = window.localStorage.getItem(CHAVE_META_ML);
    const numero = Number(salva);
    return numero > 0 ? numero : META_ML_PADRAO;
  } catch {
    return META_ML_PADRAO;
  }
}

/**
 * Custom hook que controla o consumo de água POR DIA: os registros ficam
 * guardados num mapa `{ "AAAA-MM-DD": coposConsumidos }`, então trocar o dia
 * selecionado na BarraCalendario reflete a hidratação correta daquele dia,
 * em vez de um contador único e genérico. A META (em ml) já não é fixa —
 * fica salva à parte (não é por dia, é uma preferência do usuário) e pode
 * ser ajustada pelo botão "Definir meta" do próprio widget.
 */
export function useHidratacao(dataSelecionadaISO) {
  const [registrosPorDia, setRegistrosPorDia] = useState(lerRegistrosSalvos);
  const [metaMl, setMetaMl] = useState(lerMetaMlSalva);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(registrosPorDia));
  }, [registrosPorDia]);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_META_ML, String(metaMl));
  }, [metaMl]);

  const copos = registrosPorDia[dataSelecionadaISO] || 0;

  // Clicar numa gota preenche todas as anteriores até ela; clicar de novo na
  // última gota preenchida esvazia (comportamento de toggle, não incremento).
  const alternarCopo = (indiceClicado) => {
    const posicaoClicada = indiceClicado + 1;

    setRegistrosPorDia((prev) => {
      const coposAtuais = prev[dataSelecionadaISO] || 0;
      const novoValor = coposAtuais === posicaoClicada ? posicaoClicada - 1 : posicaoClicada;
      return { ...prev, [dataSelecionadaISO]: novoValor };
    });
  };

  // Atalho de "+250ml": soma um copo direto, sem precisar clicar numa gota
  // específica. Ao contrário de `alternarCopo`, não limita ao número de
  // gotas exibidas — assim como calorias, é possível passar da meta.
  const adicionarCopo = () => {
    setRegistrosPorDia((prev) => ({
      ...prev,
      [dataSelecionadaISO]: (prev[dataSelecionadaISO] || 0) + 1,
    }));
  };

  const definirMetaMl = (novaMetaMl) => {
    const numero = Number(novaMetaMl);
    if (numero > 0) setMetaMl(numero);
  };

  return {
    copos,
    // Quantas gotas desenhar: a meta em ml dividida por 250, sempre pelo
    // menos 1, mesmo que o usuário defina uma meta menor que um copo.
    metaCopos: Math.max(1, Math.round(metaMl / ML_POR_COPO)),
    totalMl: copos * ML_POR_COPO,
    metaMl,
    alternarCopo,
    adicionarCopo,
    definirMetaMl,
  };
}
