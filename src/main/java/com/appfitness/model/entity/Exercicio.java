package com.appfitness.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Classe de entidade que representa um exercício físico.
 * Responsável por:
 * - Armazenar informações sobre o exercício, como nome, descrição, duração, etc
 * - Mapear para uma tabela no banco de dados usando JPA
 * - Relacionar-se com outras entidades, como Treino, para compor as rotinas de treino dos usuários.
 */

@Entity						// é uma entidade JPA, e que será mapeada para uma tabela no banco de dados.
@Table(name = "exercicios")	// Especifica o nome da tabela no banco de dados que esta entidade irá mapear. Neste caso, a tabela será chamada "exercicios".
public class Exercicio {

	
	// 1. Atributos da entidade Exercicio (id, nome, descricao, duracao, etc)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;			// Identificador único do exercício.
	
	private String nome;		// Nome do exercício, ex: "Agachamento"
	private int series;			// Número de séries, ex: 3
	private int repeticoes;		// Número de repetições por série, ex: 12
	private int duracao;		// Duração do exercício em minutos, ex: 30
	private String descricao;	// Descrição detalhada do exercício, ex: "Exercício
	
	// Associações 
	@ManyToOne						// Especifica que (muitos exercícios podem estar associados a um único treino)
	@JoinColumn(name = "treino_id")	// Especifica a coluna de junção para o relacionamento Many-to-One. Neste caso, a coluna será "treino_id".
	private Treino treino;			// Relacionamento Many-to-One com a entidade Treino
	
	// 2. Construtores (vazio e completo, Padrão para entidades JPA)
	private Exercicio() {
	}
	
	// 2.1 Construtor completo para facilitar a criação de objetos Exercicio
	public Exercicio(String nome, int series, int repeticoes, int duracao, String descricao, Treino treino) {
		this.nome = nome;
		this.series = series;
		this.repeticoes = repeticoes;
		this.duracao = duracao;
		this.descricao = descricao;
		this.treino = treino;
	}

	// 3. Getters e Setters para os atributos
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public int getSeries() {
		return series;
	}

	public void setSeries(int series) {
		this.series = series;
	}

	public int getRepeticoes() {
		return repeticoes;
	}

	public void setRepeticoes(int repeticoes) {
		this.repeticoes = repeticoes;
	}

	public int getDuracao() {
		return duracao;
	}

	public void setDuracao(int duracao) {
		this.duracao = duracao;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public Treino getTreino() {
		return treino;
	}

	public void setTreino(Treino treino) {
		this.treino = treino;
	}
	
	// 4. Métodos adicionais, se necessário (ex: calcular calorias queimadas)
}
