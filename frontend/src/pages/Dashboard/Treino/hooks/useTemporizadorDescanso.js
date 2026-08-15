import { useCallback, useEffect, useRef, useState } from 'react';
import { tocarAlertaSonoro, vibrarDispositivo } from '../utils/alertaSonoro';

export const DURACOES_PADRAO_SEGUNDOS = [30, 60, 90, 120];
const PASSO_AJUSTE_SEGUNDOS = 15;

/**
 * Temporizador de descanso entre séries: contagem regressiva com
 * iniciar/pausar/retomar/reiniciar/concluir (pular) e ajuste de tempo em
 * qualquer momento. Ao chegar em zero, dispara som + vibração — ambos
 * best-effort (ver `utils/alertaSonoro.js`); o indicador visual
 * (`finalizado`) é a alternativa acessível que NUNCA depende de suporte de
 * hardware/navegador, então a falta de som/vibração nunca quebra o treino.
 */
export function useTemporizadorDescanso() {
  const [duracaoTotal, setDuracaoTotal] = useState(0);
  const [restante, setRestante] = useState(0);
  const [ativo, setAtivo] = useState(false); // painel visível (iniciado, pausado ou finalizado)
  const [rodando, setRodando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  const intervaloRef = useRef(null);
  const alvoRef = useRef(null); // timestamp (ms) em que a contagem deve chegar a zero

  const pararIntervalo = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  const dispararFimDeDescanso = useCallback(() => {
    pararIntervalo();
    setRestante(0);
    setRodando(false);
    setFinalizado(true);
    tocarAlertaSonoro();
    vibrarDispositivo();
  }, [pararIntervalo]);

  const tick = useCallback(() => {
    const restanteMs = alvoRef.current - Date.now();
    if (restanteMs <= 0) {
      dispararFimDeDescanso();
      return;
    }
    setRestante(Math.ceil(restanteMs / 1000));
  }, [dispararFimDeDescanso]);

  const rodar = useCallback(() => {
    pararIntervalo();
    intervaloRef.current = setInterval(tick, 250);
  }, [tick, pararIntervalo]);

  const iniciar = useCallback(
    (segundos) => {
      setDuracaoTotal(segundos);
      setRestante(segundos);
      setAtivo(true);
      setFinalizado(false);
      setRodando(true);
      alvoRef.current = Date.now() + segundos * 1000;
      rodar();
    },
    [rodar]
  );

  const pausar = useCallback(() => {
    if (!rodando) return;
    pararIntervalo();
    setRodando(false);
  }, [rodando, pararIntervalo]);

  const retomar = useCallback(() => {
    if (rodando || restante <= 0) return;
    alvoRef.current = Date.now() + restante * 1000;
    setRodando(true);
    rodar();
  }, [rodando, restante, rodar]);

  const reiniciar = useCallback(() => {
    if (duracaoTotal <= 0) return;
    iniciar(duracaoTotal);
  }, [duracaoTotal, iniciar]);

  const concluir = useCallback(() => {
    pararIntervalo();
    setAtivo(false);
    setRodando(false);
    setFinalizado(false);
    setRestante(0);
  }, [pararIntervalo]);

  const ajustarTempo = useCallback(
    (deltaSegundos) => {
      setRestante((atual) => {
        const novo = Math.max(0, atual + deltaSegundos);
        if (rodando) {
          alvoRef.current = Date.now() + novo * 1000;
        }
        if (novo === 0) {
          dispararFimDeDescanso();
        }
        return novo;
      });
      setDuracaoTotal((atual) => Math.max(0, atual + deltaSegundos));
    },
    [rodando, dispararFimDeDescanso]
  );

  useEffect(() => pararIntervalo, [pararIntervalo]);

  return {
    ativo,
    rodando,
    finalizado,
    duracaoTotal,
    restante,
    iniciar,
    pausar,
    retomar,
    reiniciar,
    concluir,
    adicionarTempo: () => ajustarTempo(PASSO_AJUSTE_SEGUNDOS),
    removerTempo: () => ajustarTempo(-PASSO_AJUSTE_SEGUNDOS),
  };
}
