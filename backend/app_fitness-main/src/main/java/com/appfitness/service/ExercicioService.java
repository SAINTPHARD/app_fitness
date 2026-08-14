package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.exception.ExercicioDuplicadoException;
import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.ExercicioRepository;

/**
 * Classe de serviço para operações relacionadas a exercícios.
 *
 * CORREÇÃO (refatoração da tela de execução de treino): nenhuma operação
 * validava que o Treino "pai" do Exercicio pertencia ao usuário autenticado
 * (IDOR) e não havia nenhuma proteção contra o mesmo exercício sendo
 * adicionado duas vezes à mesma ficha.
 */
@Service
public class ExercicioService {

	private final ExercicioRepository repository;
	private final TreinoService treinoService;

	public ExercicioService(ExercicioRepository repository, TreinoService treinoService) {
		this.repository = repository;
		this.treinoService = treinoService;
	}

	/**
	 * 1. CREATE: adiciona um exercício a uma ficha do usuário autenticado.
	 * Bloqueia duplicidade (mesmo nome já na ficha) antes de persistir — ver
	 * também a constraint única no banco (`uk_exercicio_treino_nome`), que é
	 * a rede de segurança contra a corrida entre duas requisições
	 * simultâneas.
	 */
	@Transactional
	public Exercicio salvar(Long treinoId, Exercicio exercicio, Usuario usuarioAutenticado) {
		Treino treino = treinoService.buscarPorIdEUsuario(treinoId, usuarioAutenticado);

		if (repository.existeComMesmoNome(treino, exercicio.getNome())) {
			throw new ExercicioDuplicadoException("Este exercício já faz parte do treino atual.");
		}

		exercicio.setTreino(treino);
		return repository.save(exercicio);
	}

	/**
	 * 2. READ (escopado): busca um exercício validando que a ficha dele
	 * pertence ao usuário autenticado.
	 */
	@Transactional(readOnly = true)
	public Exercicio buscarPorIdEUsuario(Long id, Usuario usuarioAutenticado) {
		Exercicio exercicio = repository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Exercício não encontrado com ID: " + id));
		// Dispara AcessoNegadoException se o treino não for do usuário.
		treinoService.buscarPorIdEUsuario(exercicio.getTreino().getId(), usuarioAutenticado);
		return exercicio;
	}

	/**
	 * 3. UPDATE: atualiza um exercício existente do usuário autenticado. Se
	 * o novo nome colidir com outro exercício já na mesma ficha, também é
	 * bloqueado como duplicidade.
	 */
	@Transactional
	public Exercicio atualizar(Long id, Exercicio exercicioAtualizado, Usuario usuarioAutenticado) {
		Exercicio exercicio = buscarPorIdEUsuario(id, usuarioAutenticado);

		boolean nomeMudou = exercicioAtualizado.getNome() != null
				&& !exercicioAtualizado.getNome().trim().equalsIgnoreCase(exercicio.getNome().trim());
		if (nomeMudou && repository.existeComMesmoNome(exercicio.getTreino(), exercicioAtualizado.getNome())) {
			throw new ExercicioDuplicadoException("Este exercício já faz parte do treino atual.");
		}

		exercicio.setNome(exercicioAtualizado.getNome());
		exercicio.setSeries(exercicioAtualizado.getSeries());
		exercicio.setRepeticoes(exercicioAtualizado.getRepeticoes());
		exercicio.setDuracao(exercicioAtualizado.getDuracao());
		exercicio.setDescricao(exercicioAtualizado.getDescricao());

		return repository.save(exercicio);
	}

	/**
	 * 4. DELETE: exclui um exercício do usuário autenticado.
	 *
	 * IMPORTANTE (regra de negócio #12): o histórico de séries já
	 * registradas (`Serie`) NÃO é apagado junto — `Serie.exercicio` fica
	 * como referência histórica órfã (sem cascade), preservando a evolução
	 * de carga já registrada mesmo que o exercício saia de fichas futuras.
	 */
	@Transactional
	public void deletar(Long id, Usuario usuarioAutenticado) {
		Exercicio exercicio = buscarPorIdEUsuario(id, usuarioAutenticado);
		repository.delete(exercicio);
	}

	/**
	 * 5. READ ALL (escopado): lista os exercícios de uma ficha do usuário.
	 */
	@Transactional(readOnly = true)
	public List<Exercicio> listarPorTreino(Long treinoId, Usuario usuarioAutenticado) {
		return treinoService.buscarPorIdEUsuario(treinoId, usuarioAutenticado).getExercicios();
	}
}
