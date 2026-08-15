// Beep de "descanso acabou" via Web Audio API — sem arquivo de áudio
// externo (nenhuma dependência nova) e sem exigir permissão especial do
// navegador, já que só é chamado a partir de um gesto do usuário (marcar
// série concluída, ou os controles do próprio temporizador).
let contextoAudio = null;

function obterContexto() {
  if (typeof window === 'undefined') return null;
  const AudioContextClasse = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClasse) return null;

  if (!contextoAudio) {
    contextoAudio = new AudioContextClasse();
  }
  // Navegadores suspendem o contexto até um gesto do usuário — como este
  // módulo só é chamado a partir de cliques (ver useTemporizadorDescanso),
  // resume() aqui é seguro.
  if (contextoAudio.state === 'suspended') {
    contextoAudio.resume().catch(() => {});
  }
  return contextoAudio;
}

/**
 * Toca um beep curto. Falha silenciosamente (sem quebrar o treino) se o
 * navegador não suportar Web Audio ou bloquear o áudio — a ausência de som
 * nunca pode travar o fluxo de execução.
 */
export function tocarAlertaSonoro() {
  try {
    const ctx = obterContexto();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    ganho.gain.setValueAtTime(0.0001, ctx.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(ganho);
    ganho.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Sem suporte/bloqueado — o indicador visual (ver TemporizadorDescanso)
    // já cobre esse caso, não precisa de fallback aqui.
  }
}

/**
 * Vibra o dispositivo se a API existir — no-op silencioso em navegadores/
 * dispositivos sem suporte (ex: a maioria dos desktops).
 */
export function vibrarDispositivo(padrao = [200, 100, 200]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(padrao);
    }
  } catch {
    // Ignorado de propósito.
  }
}
