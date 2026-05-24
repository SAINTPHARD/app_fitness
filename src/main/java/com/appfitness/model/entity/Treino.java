package com.appfitness.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entidade que representa a rotina de treinos de um atleta.
 * Relaciona-se com a tabela de usuários via Many-to-One.
 */
@Entity							 // Indica que esta classe é uma entidade JPA, ou seja, que será mapeada para uma tabela no banco de dados.
@Table(name = "treinos") 		 // Nome da tabela no banco de dados que esta entidade irá mapear. Neste caso, a tabela será chamada "treinos".	
public class Treino {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; 			  // Chave primária necessária para o banco

	private String nomeTreino;    // Ex: "Full Body A"
	private String tipoTreino;    // Ex: "Hipertrofia", "Cardio"
	private int duracao;          // Em minutos
	private String intensidade;   // Ex: "Alta"
	private String frequencia;    // Ex: "3x por semana"
	
	@ManyToOne
	@JoinColumn(name = "usuario_id")
	private Usuario usuario;      // Chave estrangeira que liga ao Atleta

	// Construtor vazio (Obrigatório para JPA/Hibernate)
	public Treino() {
	}

	// Construtor completo para facilitar o uso no Service
	public Treino(String nomeTreino, String tipoTreino, int duracao, String intensidade, String frequencia, Usuario usuario) {
		this.nomeTreino = nomeTreino;
		this.tipoTreino = tipoTreino;
		this.duracao = duracao;
		this.intensidade = intensidade;
		this.frequencia = frequencia;
		this.usuario = usuario;
	}

	// --- GETTERS E SETTERS ---

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNomeTreino() {
		return nomeTreino;
	}

	public void setNomeTreino(String nomeTreino) {
		this.nomeTreino = nomeTreino;
	}

	public String getTipoTreino() {
		return tipoTreino;
	}

	public void setTipoTreino(String tipoTreino) {
		this.tipoTreino = tipoTreino;
	}

	public int getDuracao() {
		return duracao;
	}

	public void setDuracao(int duracao) {
		this.duracao = duracao;
	}

	public String getIntensidade() {
		return intensidade;
	}

	public void setIntensidade(String intensidade) {
		this.intensidade = intensidade;
	}

	public String getFrequencia() {
		return frequencia;
	}

	public void setFrequencia(String frequencia) {
		this.frequencia = frequencia;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	// a implementar no futuro,
	public Object getDificuldade() {
		// TODO Auto-generated method stub
		return null;
	}
}