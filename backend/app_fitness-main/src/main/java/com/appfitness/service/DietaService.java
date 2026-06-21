package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.appfitness.model.entity.Dieta;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.DietaRepository;
import com.appfitness.repository.UsuarioRepository;

/**
 * Classe de serviço para Dieta. Responsável por conter a lógica de negócios
 * relacionada à entidade Dieta, - processar os dados e interagir com o
 * repositório para realizar as operações de CRUD (Create, Read, Update,
 * Delete). Essa classe atua como intermediária entre a camada de controle
 * (DietaController) e a camada de acesso a dados (DietaRepository).
 * 
 * @Service é uma anotação do Spring que indica que esta classe é um componente
 *          de serviço, ou seja, contém a lógica de negócios da aplicação.
 */

@Service
public class DietaService {

	/**
	 * 1. DECLARAÇÃO DA DEPENDÊNCIA DO REPOSITÓRIO DE DIETA (DietaRepository)
	 * 'private': Garante o encapsulamento, restringindo o acesso apenas a esta
	 * classe. 'final': Torna a variável imutável. Uma vez atribuída no construtor,
	 * não pode ser alterada.
	 */
	private final DietaRepository dietaRepository;
	private final UsuarioRepository usuarioRepository;

	/**
	 * 1.1. CONSTRUTOR (A Injeção de Dependência) Quando o Spring inicializa a
	 * aplicação, ele percebe que DietaService precisa de um DietaRepository. Ele
	 * automaticamente usa este construtor para "injetar" (passar) a instância do
	 * repositório
	 * 
	 * @param dietaRepository
	 */
	public DietaService(DietaRepository dietaRepository, UsuarioRepository usuarioRepository) {
		this.dietaRepository = dietaRepository;
		this.usuarioRepository = usuarioRepository;
	}

	// --- MÉTODOS CRUD (Create, Read, Update, Delete) ---

	/**
	 * 1. CREATE: Salva uma nova dieta no sistema.
	 * Rota: POST http://localhost:8080/api/dietas
	 *
	public Dieta salvar(Dieta dieta) {
		return dietaRepository.save(dieta);
	}
	*/
	
	// troca temporaiamente para debugar o problema do usuario ser null
	public Dieta salvar(Dieta dieta) {
		vincularUsuario(dieta);

	    return dietaRepository.save(dieta);
	}
	

	/**
	 * 2. READ: Obtém uma dieta por ID.
	 * Rota: GET http://localhost:8080/api/dietas/{id}
	 */
	public Dieta buscarPorId(Long id) {
		return dietaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException(""
						+ "Dieta não encontrada com ID: " + id));
	}

	/**
	 * 3. UPDATE: Atualiza os dados de uma dieta existente.
	 * Rota: PUT http://localhost:8080/api/dietas/{id}
	 */
	public Dieta atualizar(Long id, Dieta dietaAtualizado) {
		Dieta dieta = buscarPorId(id);

		dieta.setNome(dietaAtualizado.getNome());
		dieta.setCalorias(dietaAtualizado.getCalorias());
		dieta.setRefeicoes(dietaAtualizado.getRefeicoes());
		dieta.setCarboidratos(dietaAtualizado.getCarboidratos());
		dieta.setProteinas(dietaAtualizado.getProteinas());
		dieta.setGorduras(dietaAtualizado.getGorduras());
		dieta.setUsuario(dietaAtualizado.getUsuario());
		vincularUsuario(dieta);

		return dietaRepository.save(dieta);
	}

	/**
	 * 4. DELETE: Exclui uma dieta do banco.
	 * Rota: DELETE http://localhost:8080/api/dietas/{id}
	 */
	public void deletar(Long id) {
		Dieta dieta = buscarPorId(id);
		dietaRepository.delete(dieta);
	}

	/**
	 * 5. READ ALL: Retorna todas as dietas salvas.
	 * Rota: GET http://localhost:8080/api/dietas
	 */
	public List<Dieta> listarTodos() {
		// CORRIGIDO: Implementado o retorno real da lista de registros
		return dietaRepository.findAll();
	}

	private void vincularUsuario(Dieta dieta) {
		if (dieta.getUsuario() != null && dieta.getUsuario().getId() != null) {
			Long usuarioId = dieta.getUsuario().getId();
			Usuario usuario = usuarioRepository.findById(usuarioId)
					.orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + usuarioId));
			dieta.setUsuario(usuario);
		}
	}
}
