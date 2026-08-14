package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.exception.AcessoNegadoException;
import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.TreinoRepository;

/**
 * Classe de serviço para a entidade Treino.
 * Responsável por implementar a lógica de negócios relacionada aos treinos.
 *
 * CORREÇÃO (refatoração da tela de execução de treino): esta classe não
 * escopava NENHUMA operação por usuário — qualquer pessoa autenticada podia
 * ler/editar/apagar o treino de outra conta só adivinhando o ID (IDOR), e
 * `listarTodos()` devolvia os treinos de todo mundo. Reescrita seguindo o
 * mesmo padrão já usado em `RefeicaoService` (buscarPorIdEUsuario,
 * listarPorUsuario, validarProprietario).
 */
@Service
public class TreinoService {

	private final TreinoRepository treinoRepository;

	public TreinoService(TreinoRepository treinoRepository) {
		this.treinoRepository = treinoRepository;
	}

	/**
	 * 1. CREATE: Salva um novo treino para o usuário autenticado.
	 * O dono nunca vem do corpo da requisição — sempre do token JWT (ver
	 * `TreinoController.criarTreino`), o mesmo motivo documentado em
	 * `RefeicaoController.criar`.
	 */
	@Transactional
	public Treino salvar(Treino treino, Usuario usuarioAutenticado) {
		treino.setUsuario(usuarioAutenticado);
		if (treino.getExercicios() != null) {
			treino.getExercicios().forEach(exercicio -> exercicio.setTreino(treino));
		}
		return treinoRepository.save(treino);
	}

	/**
	 * 2. READ: Obtém um treino por ID, com os exercícios já carregados.
	 */
	@Transactional(readOnly = true)
	public Treino buscarPorId(Long id) {
		return treinoRepository.findByIdComExercicios(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Treino não encontrado com ID: " + id));
	}

	/**
	 * 2b. READ (escopado): valida que o treino pertence ao usuário autenticado.
	 */
	@Transactional(readOnly = true)
	public Treino buscarPorIdEUsuario(Long id, Usuario usuarioAutenticado) {
		Treino treino = buscarPorId(id);
		validarProprietario(treino, usuarioAutenticado);
		return treino;
	}

	/**
	 * Busca (ou devolve vazio) a ficha do usuário para um dia da semana —
	 * usada pelo frontend para montar a tela por aba de dia sem precisar
	 * saber o ID do Treino de antemão. Não cria nada aqui: a criação
	 * "sob demanda" acontece só quando o usuário adiciona o primeiro
	 * exercício ao dia (mesmo padrão de `Refeicao` com `persistida: false`
	 * no frontend).
	 */
	@Transactional(readOnly = true)
	public Treino buscarPorDia(Usuario usuarioAutenticado, String diaSemana) {
		return treinoRepository.findByUsuarioAndDiaSemana(usuarioAutenticado, diaSemana).orElse(null);
	}

	/**
	 * 3. UPDATE: Atualiza um treino existente do usuário autenticado.
	 */
	@Transactional
	public Treino atualizar(Long id, Treino treinoAtualizado, Usuario usuarioAutenticado) {
		Treino treino = buscarPorIdEUsuario(id, usuarioAutenticado);

		treino.setNomeTreino(treinoAtualizado.getNomeTreino());
		treino.setTipoTreino(treinoAtualizado.getTipoTreino());
		treino.setDuracao(treinoAtualizado.getDuracao());
		treino.setIntensidade(treinoAtualizado.getIntensidade());
		treino.setFrequencia(treinoAtualizado.getFrequencia());

		return treinoRepository.save(treino);
	}

	/**
	 * 4. DELETE: Exclui um treino do usuário autenticado.
	 */
	@Transactional
	public void deletar(Long id, Usuario usuarioAutenticado) {
		Treino treino = buscarPorIdEUsuario(id, usuarioAutenticado);
		treinoRepository.delete(treino);
	}

	/**
	 * 5. READ ALL (escopado): lista as fichas do usuário autenticado.
	 */
	@Transactional(readOnly = true)
	public List<Treino> listarPorUsuario(Usuario usuarioAutenticado) {
		return treinoRepository.findByUsuarioComExercicios(usuarioAutenticado);
	}

	private void validarProprietario(Treino treino, Usuario usuarioAutenticado) {
		Long idDono = treino.getUsuario() != null ? treino.getUsuario().getId() : null;
		if (idDono == null || !idDono.equals(usuarioAutenticado.getId())) {
			throw new AcessoNegadoException("Este treino não pertence ao usuário autenticado.");
		}
	}
}
