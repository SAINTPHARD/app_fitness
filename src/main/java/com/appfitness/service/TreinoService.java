package com.appfitness.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.appfitness.model.entity.Treino;
import com.appfitness.repository.TreinoRepository;

/**
 * Classe de serviço para a entidade Treino.
 * Responsável por implementar a lógica de negócios relacionada aos treinos.
 */
@Service // Diz que é um componente de service usado para encapsular a lógica de negócios.
public class TreinoService {

	// 1. Injeção de dependência via Construtor (Boa prática exigida na PUC-Rio)
	private final TreinoRepository treinoRepository;
	
	public TreinoService(TreinoRepository treinoRepository) {
		this.treinoRepository = treinoRepository;
	}
	
	// --- MÉTODOS CRUD (Create, Read, Update, Delete) ---
	
	/**
	 * 1. CREATE: Salva um novo treino no sistema.
	 * Padronizado para 'salvar' para casar com a chamada do seu Controller.
	 */
	public Treino salvar(Treino treino) {
		return treinoRepository.save(treino);
	}
	
	/**
	 * 2. READ: Obtém um treino por ID.
	 * Se não encontrar, lança uma exceção limpa (padrão robusto da PUC-Rio).
	 */
	public Treino buscarPorId(Long id) {
		return treinoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Treino não encontrado com ID: " + id));
	}
	
	/**
	 * 3. UPDATE: Atualiza um treino existente.
	 * Padronizado o nome do método para condizer com o Controller.
	 */
	public Treino atualizar(Long id, Treino treinoAtualizado) {
		// Busca o treino existente usando o método acima (que já trata o erro)
		Treino treino = buscarPorId(id); 
		
		// Atualiza os campos corretos mapeados na entidade Treino
		treino.setNomeTreino(treinoAtualizado.getNomeTreino());
		treino.setTipoTreino(treinoAtualizado.getTipoTreino());
		treino.setDuracao(treinoAtualizado.getDuracao());
		treino.setIntensidade(treinoAtualizado.getIntensidade());
		treino.setFrequencia(treinoAtualizado.getFrequencia());
		
		return treinoRepository.save(treino);
	}
	
	/**
	 * 4. DELETE: Exclui um treino por ID.
	 * Padronizado o nome do método para 'deletar'.
	 */
	public void deletar(Long id) {
		// Boa prática: Verificar se existe antes de tentar deletar
		Treino treino = buscarPorId(id);
		treinoRepository.delete(treino);
	}
	
	/**
	 * 5. READ ALL: Listar todos os treinos cadastrados no sistema.
	 */
	public List<Treino> listarTodos() {
		return treinoRepository.findAll();
	}
}