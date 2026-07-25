const ROTULOS_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Converte uma data para o formato ISO (AAAA-MM-DD) usado como identificador
 * único de "dia" em toda a feature de dieta (refeições, hidratação etc.).
 * Usar o formato ISO (em vez de `Date` ou timestamp) evita problemas de
 * fuso-horário ao comparar/serializar no localStorage.
 */
export function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function obterDataDeHojeISO() {
  return formatarDataISO(new Date());
}

/**
 * Monta os 7 dias (Domingo a Sábado) da semana que contém `dataReferenciaISO`,
 * para alimentar a BarraCalendario. Sempre retorna a semana completa, mesmo
 * que a data de referência esteja no meio dela.
 */
export function obterDiasDaSemana(dataReferenciaISO) {
  const [ano, mes, dia] = dataReferenciaISO.split('-').map(Number);
  const dataReferencia = new Date(ano, mes - 1, dia);
  const indiceDiaDaSemana = dataReferencia.getDay(); // 0 (Dom) até 6 (Sáb)

  const inicioDaSemana = new Date(dataReferencia);
  inicioDaSemana.setDate(dataReferencia.getDate() - indiceDiaDaSemana);

  return Array.from({ length: 7 }, (_, indice) => {
    const dataDoDia = new Date(inicioDaSemana);
    dataDoDia.setDate(inicioDaSemana.getDate() + indice);

    return {
      iso: formatarDataISO(dataDoDia),
      rotulo: ROTULOS_DIAS[indice],
      numero: dataDoDia.getDate(),
    };
  });
}
