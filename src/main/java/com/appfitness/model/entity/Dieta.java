package com.appfitness.model.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Classe de entidade para representar a Dieta no sistema.
 * Esta classe deve conter os atributos relacionados à dieta, como:
 * - id (identificador único)
 * - nome (nome da dieta)
 * - descrição (detalhes sobre a dieta)
 * - calorias (quantidade de calorias diárias)
 * - refeições (lista de refeições associadas à dieta)
 * Além disso, deve incluir os métodos getters e setters para acessar e modificar esses atributos.
 */
/**
 * 1. Anotações JPA para a classe Dieta:
 * - @Entity: Indica que esta classe é uma entidade JPA, ou seja, representa uma tabela no banco de dados.
 * - @Table(name = "dietas"): Especifica o nome da tabela no banco de dados para esta entidade no PostgreSQl.
 */
@Entity
@Table(name = "dietas")
public class Dieta {

	// 1. Atributos da entidade Dieta
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) // Geração automática do ID
	private Long id;
	
	// 2. Validações para o campo nome da dieta
	@NotBlank(message = "O nome da dieta é obrigatório")
	@Size(max = 100, message = "O nome da dieta deve ter no máximo 100 caracteres")
	@Column(nullable = false, length = 100) // Define a coluna no banco de dados como não nula e com tamanho máximo de 100 caracteres
	private String nome;					// Ex: "Dieta Low Carb"
	
	@NotNull(message = "A quantidade de calorias da dieta é obrigatória")
	@Positive(message = "A quantidade da dieta deve ser maior que zero")
	private Integer calorias;
	
	@NotBlank(message = "As refeições da dieta são obrigatórias")
	@Size(max = 500, message = "As refeições da dieta devem ter no máximo 500 caracteres")
	private String refeicoes; // Ex: "Café da manhã: ovos mexidos, Almoço: frango grelhado, Jantar: salada de atum"
	
	@NotNull(message = "A quantidade de carboidratos é obrigatória")
	@Positive(message = "A quantidade de carboidratos deve ser maior que zero")
	private BigDecimal carboidratos;
	
	@NotNull(message = "A quantidade de proteínas é obrigatória")
	@Positive(message = "A quantidade de proteínas deve ser maior que zero")
	private BigDecimal proteinas;
	
	@NotNull(message = "A quantidade de gorduras é obrigatória")
	@Positive(message = "A quantidade de gorduras deve ser maior que zero")
	private BigDecimal gorduras;
	
	// 2. Construtor vazio (necessário para JPA)
	public Dieta() {
		
	}
	
	/**
	 * Relacionamento entre Dieta e Usuario:
	 * 
	 */
	//@JsonIgnore 
	@ManyToOne	// Muitas dietas podem estar associadas a um usuário.
	@JoinColumn(name = "usuario_id") // Especifica a coluna de junção no banco de dados para o relacionamento entre Dieta e Usuario.
	private Usuario usuario; // A dieta está associada a um usuário específico, indicando a quem pertence essa dieta.
	
	/**
	 * Construtor com parâmetros para facilitar a criação de objetos Dieta.
	 * @param nome
	 * @param calorias
	 * @param refeicoes
	 * @param carboidratos
	 * @param proteinas
	 * @param gorduras
	 */
	
	// 3. Construtor com parâmetros (opcional, mas útil para facilitar a criação de objetos Dieta)
	public Dieta(String nome, Integer calorias, String refeicoes, BigDecimal carboidratos
			, BigDecimal proteinas, BigDecimal gorduras) {
		this.nome = nome;
		this.calorias = calorias;
		this.refeicoes = refeicoes;
		this.carboidratos = carboidratos;
		this.proteinas = proteinas;
		this.gorduras = gorduras;
	}

	// 4. Getters e Setters para acessar e modificar os atributos da entidade Dieta
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

	public Integer getCalorias() {
	    return calorias;
	}

	public void setCalorias(Integer calorias) {
	    this.calorias = calorias;
	}

	public String getRefeicoes() {
		return refeicoes;
	}

	public void setRefeicoes(String refeicoes) {
		this.refeicoes = refeicoes;
	}

	public BigDecimal getCarboidratos() {
		return carboidratos;
	}

	public void setCarboidratos(BigDecimal carboidratos) {
		this.carboidratos = carboidratos;
	}

	public BigDecimal getProteinas() {
		return proteinas;
	}

	public void setProteinas(BigDecimal proteinas) {
		this.proteinas = proteinas;
	}

	public BigDecimal getGorduras() {
		return gorduras;
	}

	public void setGorduras(BigDecimal gorduras) {
		this.gorduras = gorduras;
	}
	
	public Usuario getUsuario() {
		return usuario;
	}
	
	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}
	
}
