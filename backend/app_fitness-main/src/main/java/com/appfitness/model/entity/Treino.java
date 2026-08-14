package com.appfitness.model.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Entidade que representa a rotina de treinos de um atleta.
 * Relaciona-se com a tabela de usuários via Many-to-One.
 */
@Entity							 // Indica que esta classe é uma entidade JPA, ou seja, que será mapeada para uma tabela no banco de dados.
@Table(name = "treinos") 		 // Nome da tabela no banco de dados que esta entidade irá mapear. Neste caso, a tabela será chamada "treinos".
@JsonIgnoreProperties(ignoreUnknown = true)
public class Treino {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; 			  // Chave primária necessária para o banco

	private String nomeTreino;    // Ex: "Full Body A"
	private String tipoTreino;    // Ex: "Hipertrofia", "Cardio"
	private Integer duracao;      // Em minutos
	private String intensidade;   // Ex: "Alta"
	private String frequencia;    // Ex: "3x por semana"

	/**
	 * Dia da semana ao qual esta ficha pertence ("segunda".."domingo") — o
	 * frontend organiza o treino em abas por dia (ver `diasSemana.js`); cada
	 * combinação (usuario, diaSemana) tem no máximo uma ficha "ativa"
	 * (ver `TreinoService.obterOuCriarPorDia`).
	 */
	private String diaSemana;

	/**
	 * Relacionamento entre Treino e Usuario:
	 * - Um usuário pode ter várias rotinas de treino associadas a ele  (ManyToOne).
	 * - A entidade Treino tem uma relação Many-to-One com a entidade Usuario,
	 * indicando que muitos treinos podem estar associados a um único usuário.
	 */
	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "usuario_id")
	private Usuario usuario;      // Chave estrangeira que liga ao Atleta

	/**
	 * Exercícios desta ficha. Mesmo padrão de `Refeicao.alimentos`: cascade
	 * total + orphanRemoval, para o frontend poder ler `treino.exercicios`
	 * junto com o treino numa única resposta.
	 */
	@OneToMany(mappedBy = "treino", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Exercicio> exercicios = new ArrayList<>();


	// Construtor vazio (Obrigatório para JPA/Hibernate)
	public Treino() {
	}
	
	// Construtor completo para facilitar o uso no Service
	public Treino(String nomeTreino, String tipoTreino, Integer duracao, String intensidade, String frequencia, Usuario usuario) {
		this.nomeTreino = nomeTreino;
		this.tipoTreino = tipoTreino;
		this.duracao = duracao;
		this.intensidade = intensidade;
		this.frequencia = frequencia;
		this.usuario = usuario;
	}

	public String getDiaSemana() {
		return diaSemana;
	}

	public void setDiaSemana(String diaSemana) {
		this.diaSemana = diaSemana;
	}

	public List<Exercicio> getExercicios() {
		return exercicios;
	}

	public void setExercicios(List<Exercicio> exercicios) {
		this.exercicios = exercicios;
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

	public Integer getDuracao() {
		return duracao;
	}

	public void setDuracao(Integer duracao) {
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
}
