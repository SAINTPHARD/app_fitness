const LIMITE_REQUISICAO_LENTA_MS = 3000;

const FLUXOS = [
  ['/auth/login', 'login'],
  ['/usuarios/onboarding', 'onboarding'],
  ['/refeicoes', 'refeicao'],
  ['/sessoes-treino', 'treino'],
  ['/relatorios', 'exportacao'],
];

function publicar(nome, dados = {}) {
  const evento = { nome, ...dados };
  window.dispatchEvent(new CustomEvent('systemfitness:telemetria', { detail: evento }));

  if (!import.meta.env.PROD && import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
    console.info('[telemetria]', evento);
  }
}

export function normalizarRota(url = '') {
  const pathname = String(url).split('?')[0];
  return pathname
    .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

export function identificarFluxo(url = '') {
  const rota = normalizarRota(url);
  return FLUXOS.find(([prefixo]) => rota.includes(prefixo))?.[1] ?? null;
}

export function medirRequisicao(config, status, sucesso) {
  const inicio = config?.metadata?.inicio;
  if (!inicio) return;

  const duracaoMs = Math.round(performance.now() - inicio);
  const rota = normalizarRota(config.url);
  const fluxo = identificarFluxo(rota);
  const dados = { rota, metodo: config.method?.toUpperCase(), status, duracaoMs, sucesso };

  publicar('requisicao', dados);
  if (duracaoMs >= LIMITE_REQUISICAO_LENTA_MS) publicar('requisicao_lenta', dados);
  if (!sucesso && fluxo) publicar('falha_fluxo', { fluxo, status, duracaoMs });
}

export function iniciarWebVitals() {
  if (typeof PerformanceObserver === 'undefined') return;

  const observar = (tipo, callback) => {
    try {
      const observer = new PerformanceObserver((lista) => callback(lista.getEntries()));
      observer.observe({ type: tipo, buffered: true });
    } catch {
      // O navegador pode não implementar uma métrica específica.
    }
  };

  observar('largest-contentful-paint', (entradas) => {
    const ultimo = entradas.at(-1);
    if (ultimo) publicar('web_vital', { metrica: 'LCP', valor: Math.round(ultimo.startTime) });
  });

  observar('layout-shift', (entradas) => {
    const cls = entradas.filter((item) => !item.hadRecentInput).reduce((total, item) => total + item.value, 0);
    if (cls > 0) publicar('web_vital', { metrica: 'CLS', valor: Number(cls.toFixed(4)) });
  });

  observar('event', (entradas) => {
    const inp = Math.max(0, ...entradas.map((item) => item.duration || 0));
    if (inp) publicar('web_vital', { metrica: 'INP', valor: Math.round(inp) });
  });
}
