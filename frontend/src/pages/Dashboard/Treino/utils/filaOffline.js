// Fila de operações de treino ainda não confirmadas pelo servidor —
// persistida em localStorage para sobreviver a um reload/fechamento do
// navegador enquanto offline. Cada item guarda `tipo` (nome do método em
// `fitnessApi`) + `args` (argumentos posicionais, só valores serializáveis
// em JSON), então re-executar um item mais tarde é só
// `fitnessApi[item.tipo](...item.args)` — não depende de nenhuma closure
// que só existia na aba que enfileirou.
const CHAVE_ARMAZENAMENTO = 'treino-fila-offline';

export function lerFila() {
  if (typeof window === 'undefined') return [];
  try {
    const salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

function salvarFila(fila) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(fila));
  } catch {
    // localStorage indisponível (modo privado, quota cheia) — a operação
    // ainda foi tentada online normalmente; só a persistência para retry
    // após reload fica indisponível, não é motivo para quebrar o treino.
  }
}

// Upsert por `chave`: reenfileirar a mesma operação (ex: usuário mexeu de
// novo na mesma série ainda offline) atualiza o item existente em vez de
// empilhar duplicatas na fila.
export function enfileirar(item) {
  const fila = lerFila().filter((existente) => existente.chave !== item.chave);
  fila.push({ ...item, criadoEm: Date.now() });
  salvarFila(fila);
  return fila;
}

export function removerDaFila(chave) {
  const fila = lerFila().filter((item) => item.chave !== chave);
  salvarFila(fila);
  return fila;
}
