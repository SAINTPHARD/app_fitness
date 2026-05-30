package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.appfitness.model.entity.Exercicio;
import com.appfitness.repository.ExercicioRepository;

/**
 * Classe de serviço para operações relacionadas a exercícios.
 * Responsável por:
 * - CRUD de exercícios_: Create, Read, Update, Delete = Criar, Ler, Atualizar, Deletar
 * - Regras básicas de negócio relacionadas aos exercícios
 */

@Service
public class ExercicioService {

	// 1- Injeção de dependência via Construtor
	private final ExercicioRepository repository;
	
	public ExercicioService(ExercicioRepository repository) {
		this.repository = repository;
	}
	
	// --- MÉTODOS CRUD (Create, Read, Update, Delete) ---
	
	// 1. CREATE: Salva um novo exercício no sistema.
	public Exercicio salvar(Exercicio exercicio) {
		return repository.save(exercicio);
	}
	
	// 2. READ: Obtém um exercício por ID.
	public Exercicio buscarPorId(long id) {
		return repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Exercício não encontrado com ID: " + id));
	}
	
	// 3. UPDATE: Atualiza um exercício existente.
	public Exercicio atualizar(long id, Exercicio exercicioAtualizado) {
		// Busca o exercício existente usando o método acima (que já trata o erro)
		Exercicio exercicio = buscarPorId(id); 
		
		// Atualiza os campos corretos mapeados na entidade Exercicio
		exercicio.setNome(exercicioAtualizado.getNome());
		exercicio.setSeries(exercicioAtualizado.getSeries());
		exercicio.setRepeticoes(exercicioAtualizado.getRepeticoes());
		exercicio.setDuracao(exercicioAtualizado.getDuracao());
		exercicio.setDescricao(exercicioAtualizado.getDescricao());
		
		return repository.save(exercicio);
	}
	
	// 4. DELETE: Exclui um exercício por ID.
	public void deletar(Long id) {
        Exercicio exercicio = buscarPorId(id);
        repository.delete(exercicio);
    }
	
	// 5. Listar todos os exercícios
	public List<Exercicio> listarTodos() {
		return repository.findAll();
	}
}