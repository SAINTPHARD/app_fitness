package com.appfitness.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.Alimento;
import com.appfitness.model.entity.Refeicao;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.RefeicaoRepository;
import com.appfitness.repository.UsuarioRepository;

/**
 * Classe de serviço para Refeição. Responsável por conter a lógica de negócios
 * relacionada à entidade Refeicao, processar os dados e interagir com o
 * repositório para realizar as operações de CRUD (Create, Read, Update,
 * Delete). Essa classe atua como intermediária entre a camada de controle
 * (RefeicaoController) e a camada de acesso a dados (RefeicaoRepository).
 *
 * @Service é uma anotação do Spring que indica que esta classe é um componente
 *          de serviço, ou seja, contém a lógica de negócios da aplicação.
 */
@Service
public class RefeicaoService {

	private final RefeicaoRepository refeicaoRepository;
	private final UsuarioRepository usuarioRepository;

	public RefeicaoService(RefeicaoRepository refeicaoRepository, UsuarioRepository usuarioRepository) {
		this.refeicaoRepository = refeicaoRepository;
		this.usuarioRepository = usuarioRepository;
	}

	// --- MÉTODOS CRUD (Create, Read, Update, Delete) ---

	/**
	 * 1. CREATE: Salva uma nova refeição no sistema.
	 * Rota: POST http://localhost:8080/refeicoes
	 */
	@Transactional
	public Refeicao salvar(Refeicao refeicao) {
		vincularUsuario(refeicao);

		// Garante que cada Alimento vindo no corpo da requisição já aponte para esta Refeição,
		// para que o CascadeType.ALL configurado em Refeicao.alimentos persista tudo em uma só operação.
		if (refeicao.getAlimentos() != null) {
			refeicao.getAlimentos().forEach(alimento -> alimento.setRefeicao(refeicao));
		}

		return refeicaoRepository.save(refeicao);
	}

	/**
	 * 2. READ: Obtém uma refeição por ID.
	 * Rota: GET http://localhost:8080/refeicoes/{id}
	 */
	public Refeicao buscarPorId(Long id) {
		return refeicaoRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Refeição não encontrada com ID: " + id));
	}

	/**
	 * 3. UPDATE: Atualiza os dados de uma refeição existente.
	 * Rota: PUT http://localhost:8080/refeicoes/{id}
	 */
	@Transactional
	public Refeicao atualizar(Long id, Refeicao refeicaoAtualizada) {
		Refeicao refeicao = buscarPorId(id);

		refeicao.setNomeRefeicao(refeicaoAtualizada.getNomeRefeicao());
		refeicao.setDataRefeicao(refeicaoAtualizada.getDataRefeicao());
		refeicao.setHorario(refeicaoAtualizada.getHorario());
		refeicao.setUsuario(refeicaoAtualizada.getUsuario());
		vincularUsuario(refeicao);

		return refeicaoRepository.save(refeicao);
	}

	/**
	 * 4. DELETE: Exclui uma refeição do banco.
	 * Rota: DELETE http://localhost:8080/refeicoes/{id}
	 */
	@Transactional
	public void deletar(Long id) {
		Refeicao refeicao = buscarPorId(id);
		refeicaoRepository.delete(refeicao);
	}

	/**
	 * 5. READ ALL: Retorna todas as refeições salvas.
	 * Rota: GET http://localhost:8080/refeicoes
	 */
	public List<Refeicao> listarTodos() {
		return refeicaoRepository.findAll();
	}

	// ==========================================
	// --- MÉTODOS ESPECÍFICOS PARA O REACT ---
	// ==========================================

	/**
	 * Busca todas as refeições cadastradas em uma data específica.
	 */
	public List<Refeicao> buscarPorData(LocalDate data) {
		return refeicaoRepository.findByDataRefeicao(data);
	}

	/**
	 * Adiciona um novo alimento a uma refeição existente.
	 * O Alimento recebido ainda não está persistido (é "transiente"): associamos o lado
	 * dono do relacionamento (alimento.refeicao) e deixamos o CascadeType.ALL configurado
	 * em Refeicao.alimentos persistir o Alimento junto com o save da Refeição,
	 * evitando a TransientPropertyValueException.
	 *
	 * CORREÇÃO: retorna o Alimento criado (não a Refeicao inteira) — o
	 * frontend (useRefeicoes.js) espera receber o alimento recém-criado para
	 * inserir na lista local; devolver a Refeicao fazia o React empurrar um
	 * objeto errado (sem calorias/proteína/etc. e com o id da refeição, não
	 * do alimento) na lista, deixando esse item sem um id de alimento válido
	 * para uma edição/remoção subsequente.
	 */
	@Transactional
	public Alimento adicionarAlimento(Long idRefeicao, Alimento novoAlimento) {
		Refeicao refeicao = buscarPorId(idRefeicao);

		novoAlimento.setRefeicao(refeicao);
		refeicao.getAlimentos().add(novoAlimento);

		// O cascade (CascadeType.ALL) persiste o novoAlimento junto com o save
		// da Refeição; a estratégia IDENTITY preenche o id gerado direto na
		// mesma instância de `novoAlimento` durante o flush deste save.
		refeicaoRepository.save(refeicao);
		return novoAlimento;
	}

	/**
	 * Atualiza um alimento já existente dentro de uma refeição (ex: usuário
	 * corrigiu a quantidade/macros). Antes desse método, não havia nenhuma
	 * rota de UPDATE para um alimento individual — qualquer PUT em
	 * /refeicoes/{id}/alimentos/{id} batia num caminho só mapeado para POST/
	 * DELETE e o Spring respondia 405 Method Not Allowed.
	 */
	@Transactional
	public Alimento atualizarAlimento(Long idRefeicao, Long idAlimento, Alimento alimentoAtualizado) {
		Refeicao refeicao = buscarPorId(idRefeicao);

		Alimento alimentoExistente = refeicao.getAlimentos().stream()
				.filter(alimento -> alimento.getId().equals(idAlimento))
				.findFirst()
				.orElseThrow(() -> new RecursoNaoEncontradoException(
						"Alimento não encontrado com ID: " + idAlimento + " na Refeição: " + idRefeicao));

		alimentoExistente.setNome(alimentoAtualizado.getNome());
		alimentoExistente.setQuantidade(alimentoAtualizado.getQuantidade());
		alimentoExistente.setCalorias(alimentoAtualizado.getCalorias());
		alimentoExistente.setCarboidratos(alimentoAtualizado.getCarboidratos());
		alimentoExistente.setProteinas(alimentoAtualizado.getProteinas());
		alimentoExistente.setGorduras(alimentoAtualizado.getGorduras());

		refeicaoRepository.save(refeicao);
		return alimentoExistente;
	}

	/**
	 * Remove um alimento de uma refeição existente.
	 * Graças ao orphanRemoval = true configurado em Refeicao.alimentos, basta remover
	 * o Alimento da lista para que o Hibernate exclua o registro correspondente no banco.
	 */
	@Transactional
	public Refeicao removerAlimento(Long idRefeicao, Long idAlimento) {
		Refeicao refeicao = buscarPorId(idRefeicao);

		boolean removido = refeicao.getAlimentos()
				.removeIf(alimento -> alimento.getId().equals(idAlimento));

		if (!removido) {
			throw new RecursoNaoEncontradoException(
					"Alimento não encontrado com ID: " + idAlimento + " na Refeição: " + idRefeicao);
		}

		return refeicaoRepository.save(refeicao);
	}

	private void vincularUsuario(Refeicao refeicao) {
		if (refeicao.getUsuario() != null && refeicao.getUsuario().getId() != null) {
			Long usuarioId = refeicao.getUsuario().getId();
			Usuario usuario = usuarioRepository.findById(usuarioId)
					.orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com ID: " + usuarioId));
			refeicao.setUsuario(usuario);
		}
	}
}
