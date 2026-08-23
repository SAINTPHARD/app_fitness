import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dumbbell } from 'lucide-react';
import { ehUrlMidiaValida, obterTemaExercicio } from '../utils/visualExercicio';

const TAMANHOS = {
  sm: { caixa: 'h-12 w-12', icone: 20 },
  md: { caixa: 'h-14 w-14', icone: 24 },
};

/**
 * Miniatura do exercício exibida à esquerda de cada card.
 * Usa o gif/imagem do catálogo quando existe e, se a imagem falhar ou não
 * houver URL, cai para um tile colorido pelo grupamento muscular.
 * Decorativa: o nome do exercício fica ao lado, então alt="".
 */
export default function MiniaturaExercicio({ nome, grupoMuscular, gifUrl, tamanho = 'md' }) {
  const [falhou, setFalhou] = useState(false);
  const { caixa, icone } = TAMANHOS[tamanho] || TAMANHOS.md;
  const tema = obterTemaExercicio(nome, grupoMuscular);
  const url = ehUrlMidiaValida(gifUrl) ? gifUrl.trim() : null;

  // Reseta o fallback quando o card passa a apontar para outra mídia.
  useEffect(() => {
    setFalhou(false);
  }, [url]);

  if (url && !falhou) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFalhou(true)}
        className={`${caixa} shrink-0 rounded-xl bg-zinc-100 object-cover dark:bg-zinc-800`}
      />
    );
  }

  return (
    <span aria-hidden="true" className={`${caixa} grid shrink-0 place-items-center rounded-xl ${tema.fundo}`}>
      <Dumbbell size={icone} strokeWidth={2} className={tema.icone} />
    </span>
  );
}

MiniaturaExercicio.propTypes = {
  nome: PropTypes.string,
  grupoMuscular: PropTypes.string,
  gifUrl: PropTypes.string,
  tamanho: PropTypes.oneOf(['sm', 'md']),
};
