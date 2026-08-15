import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cronômetro geral da sessão de treino: conta para cima, sobrevive a
 * re-renders de outros componentes (o tempo real vem de `Date.now()` num
 * ref, não de somar "+1" a cada tick — isso evita deriva se o navegador
 * atrasar um tick sob carga) e limpa o `setInterval` corretamente tanto ao
 * pausar quanto ao desmontar o componente.
 */
export function useCronometro() {
  const [segundos, setSegundos] = useState(0);
  const [rodando, setRodando] = useState(false);
  const intervaloRef = useRef(null);
  const inicioRef = useRef(null); // timestamp (ms) de quando o cronômetro começou a contar desta vez
  const segundosAcumuladosRef = useRef(0); // soma de todos os trechos já rodados antes da pausa atual

  const pararIntervalo = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const decorridoDesdeInicio = Math.floor((Date.now() - inicioRef.current) / 1000);
    setSegundos(segundosAcumuladosRef.current + decorridoDesdeInicio);
  }, []);

  const iniciar = useCallback(() => {
    if (rodando) return;
    inicioRef.current = Date.now();
    setRodando(true);
    pararIntervalo();
    intervaloRef.current = setInterval(tick, 250);
  }, [rodando, tick, pararIntervalo]);

  const pausar = useCallback(() => {
    if (!rodando) return;
    const decorridoDesdeInicio = Math.floor((Date.now() - inicioRef.current) / 1000);
    segundosAcumuladosRef.current += decorridoDesdeInicio;
    setSegundos(segundosAcumuladosRef.current);
    setRodando(false);
    pararIntervalo();
  }, [rodando, pararIntervalo]);

  const retomar = useCallback(() => {
    iniciar();
  }, [iniciar]);

  const resetar = useCallback(() => {
    pararIntervalo();
    segundosAcumuladosRef.current = 0;
    inicioRef.current = null;
    setSegundos(0);
    setRodando(false);
  }, [pararIntervalo]);

  // Cleanup garantido: se o componente desmontar com o cronômetro rodando
  // (ex: usuário navega para outra página no meio do treino), o interval
  // não pode continuar vivo em segundo plano.
  useEffect(() => pararIntervalo, [pararIntervalo]);

  return { segundos, rodando, iniciar, pausar, retomar, resetar };
}

export function formatarDuracao(totalSegundos) {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const dois = (n) => String(n).padStart(2, '0');
  return horas > 0 ? `${horas}:${dois(minutos)}:${dois(segundos)}` : `${dois(minutos)}:${dois(segundos)}`;
}
