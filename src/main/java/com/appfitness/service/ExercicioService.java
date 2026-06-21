package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Treino;
import com.appfitness.repository.ExercicioRepository;
import com.appfitness.repository.TreinoRepository; // Garante o acesso ao banco de treinos

/**
 * Classe de serviço para operações relacionadas a exercícios.
 * Responsável por:
 * - CRUD de exercícios: Create, Read, Update, Delete = Criar, Ler, Atualizar, Deletar
 * - Regras básicas de negócio relacionadas aos exercícios
 */
@Service
public class ExercicioService {

	// Injeção de dependência via Construtor
	private final ExercicioRepository repository;
	private final TreinoRepository treinoRepository;
	
	public ExercicioService(ExercicioRepository repository, TreinoRepository treinoRepository) {
		this.repository = repository;
		this.treinoRepository = treinoRepository;
	}
	
	// --- MÉTODOS CRUD (Create, Read, Update, Delete) ---
	
	// 1. CREATE: Salva um novo exercício no sistema.
	public Exercicio salvar(Exercicio exercicio) {
		vincularTreino(exercicio);
		return repository.save(exercicio);
	}
	
	private void vincularTreino(Exercicio exercicio) {
		// Verifica se o JSON enviado possui um vínculo de treino com ID válido
		if (exercicio.getTreino() != null && exercicio.getTreino().getId() != null) {
			Long treinoId = exercicio.getTreino().getId();
			
			// Busca o treino completo na base de dados
			Treino treinoCompleto = treinoRepository.findById(treinoId)
					.orElseThrow(() -> new RuntimeException("Treino não encontrado com ID: " + treinoId));
			
			// Vincula o treino totalmente povoado ao exercício
			exercicio.setTreino(treinoCompleto);
		} else {
			throw new RuntimeException("Não é possível salvar um exercício sem um Treino associado.");
		}
	}
	
	// 2. READ: Obtém um exercício por ID (Ajustado para Long com L maiúsculo).
	public Exercicio buscarPorId(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Exercício não encontrado com ID: " + id));
	}
	
	// 3. UPDATE: Atualiza um exercício existente de forma resiliente.
	public Exercicio atualizar(Long id, Exercicio exercicioAtualizado) {
		// Busca o exercício existente usando o método acima (que já trata o erro)
		Exercicio exercicio = buscarPorId(id); 
		
		// Atualiza os campos primitivos mapeados na entidade Exercicio
		exercicio.setNome(exercicioAtualizado.getNome());
		exercicio.setSeries(exercicioAtualizado.getSeries());
		exercicio.setRepeticoes(exercicioAtualizado.getRepeticoes());
		exercicio.setDuracao(exercicioAtualizado.getDuracao());
		exercicio.setDescricao(exercicioAtualizado.getDescricao());
		
		// Se vier nulo, mantém o treino original intacto sem quebrar o banco.
		if (exercicioAtualizado.getTreino() != null && exercicioAtualizado.getTreino().getId() != null) {
			Long novoTreinoId = exercicioAtualizado.getTreino().getId();
			Treino novoTreinoCompleto = treinoRepository.findById(novoTreinoId)
					.orElseThrow(() -> new RuntimeException(""
							+ "Novo Treino não encontrado com "
							+ "ID: " + novoTreinoId));
			exercicio.setTreino(novoTreinoCompleto);
		}
		
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