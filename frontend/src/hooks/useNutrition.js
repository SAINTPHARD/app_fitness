import { useContext } from 'react';
import { NutritionContext } from '../context/nutritionContextBase';

export function useNutrition() {
  const contexto = useContext(NutritionContext);
  if (!contexto) throw new Error('useNutrition deve ser usado dentro de NutritionProvider.');
  return contexto;
}
