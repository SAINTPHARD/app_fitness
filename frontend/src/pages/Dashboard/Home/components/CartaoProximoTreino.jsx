import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useFichasTreino } from '../../Treino/hooks/useFichasTreino';
import { obterIdDiaDaSemanaAtual, obterInfoDoDia } from '../../Treino/utils/diasSemana';
import estilos from './CartaoProximoTreino.module.css';

/**
 * Mostra o treino de hoje de verdade — reaproveita `useFichasTreino` (a
 * mesma fonte de dados persistida usada na página Treino) e o foco do dia
 * da semana atual, em vez do card fixo/mocado de antes.
 */
export default function CartaoProximoTreino() {
  const { fichasPorDia } = useFichasTreino();
  const diaHojeId = obterIdDiaDaSemanaAtual();
  const infoHoje = obterInfoDoDia(diaHojeId);
  const exerciciosHoje = fichasPorDia[diaHojeId] || [];
  const concluidos = exerciciosHoje.filter((exercicio) => exercicio.concluido).length;

  return (
    <article className={estilos.cartao}>
      <div className={estilos.cabecalho}>
        <span className={estilos.icone}>
          <Dumbbell size={18} strokeWidth={2.5} />
        </span>
        <div>
          <p className={estilos.rotulo}>Próximo treino</p>
          <p className={estilos.diaLabel}>Hoje · {infoHoje?.label}</p>
        </div>
      </div>

      <p className={estilos.nomeTreino}>{infoHoje?.foco}</p>

      {exerciciosHoje.length > 0 ? (
        <p className={estilos.horario}>
          {concluidos}/{exerciciosHoje.length} exercícios concluídos
        </p>
      ) : (
        <p className={estilos.horario}>Nenhum exercício cadastrado para hoje ainda</p>
      )}

      <Link to="/dashboard/treino" className={estilos.botao}>
        {exerciciosHoje.length > 0 ? 'Iniciar treino' : 'Montar ficha de hoje'}
      </Link>
    </article>
  );
}
