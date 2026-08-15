export function reportarErro(error, contexto = {}) {
  const sentryBrowser = typeof window !== 'undefined' ? window.Sentry : null;

  if (sentryBrowser?.captureException && import.meta.env.VITE_SENTRY_DSN) {
    sentryBrowser.captureException(error, {
      extra: {
        origem: contexto.origem,
      },
    });
    return;
  }

  if (!import.meta.env.PROD) {
    console.error(error);
  }
}
