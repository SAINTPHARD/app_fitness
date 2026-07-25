import { useEffect, useState } from 'react';

const CHAVE_ARMAZENAMENTO = 'dieta-metas';
const METAS_PADRAO = { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };

function lerMetasSalvas() {
  if (typeof window === 'undefined') return METAS_PADRAO;

  try {
    const metasSalvas = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    return metasSalvas ? { ...METAS_PADRAO, ...JSON.parse(metasSalvas) } : METAS_PADRAO;
  } catch {
    return METAS_PADRAO;
  }
}

/**
 * Custom hook responsável por toda a lógica de negócio das metas diárias
 * (calorias, proteínas, carboidratos e gorduras): leitura inicial, persistência
 * em localStorage e atualização — mantendo os componentes visuais (PainelDieta,
 * ModalMetas) livres de detalhes de armazenamento.
 */
export function useMetas() {
  const [metas, setMetas] = useState(lerMetasSalvas);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(metas));
  }, [metas]);

  // Recebe o rascunho já validado (ver `validarMetas`) e normaliza para número
  // antes de gravar no estado — o componente de UI nunca precisa saber disso.
  const atualizarMetas = (novasMetas) => {
    setMetas({
      calorias: Number(novasMetas.calorias) || 0,
      proteinas: Number(novasMetas.proteinas) || 0,
      carboidratos: Number(novasMetas.carboidratos) || 0,
      gorduras: Number(novasMetas.gorduras) || 0,
    });
  };

  return { metas, atualizarMetas };
}
