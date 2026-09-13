import { useContext } from 'react';
import { MetasContext } from '../context/metasContextBase';

export function useMetasContext() {
  const contexto = useContext(MetasContext);
  if (!contexto) throw new Error('useMetasContext deve ser usado dentro de MetasProvider.');
  return contexto;
}
