import { useCallback, useState } from 'react';

const ML_POR_COPO = 250;

/**
 * Encapsula o registro rápido de água feito direto na Home (botão "+250 ml"
 * e o "Desfazer" que aparece logo em seguida). Estava inline no `index.jsx`
 * misturado com a montagem do layout; aqui fica só a máquina de estados
 * dessa interação — pendente/erro/último registro — que é o que o cartão
 * precisa saber para habilitar ou não os botões.
 *
 * O "Desfazer" cobre apenas o último registro feito nesta sessão de tela: é
 * um atalho de correção imediata, não um histórico. Por isso o id é mantido
 * em estado local e descartado assim que o desfazer acontece.
 *
 * @param {(quantidadeMl: number) => Promise<object|undefined>} adicionarAgua
 * @param {(idRegistro: number|string) => Promise<void>} removerAgua
 */
export function useRegistroDeAgua(adicionarAgua, removerAgua) {
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [pendente, setPendente] = useState(false);
  const [anuncio, setAnuncio] = useState('');

  const registrarCopo = useCallback(async () => {
    setPendente(true);
    setAnuncio('');
    try {
      const registro = await adicionarAgua(ML_POR_COPO);
      // `adicionarAgua` devolve `undefined` quando a mutação foi barrada por
      // já haver uma idêntica em voo (ver `useBloqueioMutacao`). Nesse caso
      // nada foi persistido, então não anunciamos sucesso nem oferecemos um
      // "Desfazer" que apontaria para um registro inexistente.
      if (!registro?.id) return;
      setUltimoRegistro(registro);
      setAnuncio(`${ML_POR_COPO} mililitros de água registrados com sucesso.`);
    } catch {
      setAnuncio('Não foi possível registrar a água agora.');
    } finally {
      setPendente(false);
    }
  }, [adicionarAgua]);

  const desfazerCopo = useCallback(async () => {
    if (!ultimoRegistro?.id) return;
    setPendente(true);
    try {
      await removerAgua(ultimoRegistro.id);
      setUltimoRegistro(null);
      setAnuncio(`Registro de ${ML_POR_COPO} mililitros desfeito.`);
    } catch {
      setAnuncio('Não foi possível desfazer o registro de água.');
    } finally {
      setPendente(false);
    }
  }, [removerAgua, ultimoRegistro]);

  return {
    mlPorCopo: ML_POR_COPO,
    podeDesfazer: Boolean(ultimoRegistro?.id),
    pendente,
    anuncio,
    registrarCopo,
    desfazerCopo,
  };
}
