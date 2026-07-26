package com.appfitness.model.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

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
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Classe de entidade para representar um Alimento no sistema.
 * Cada Alimento pertence a uma única Refeição (lado "muitos" do relacionamento).
 */
@Entity
@Table(name = "alimentos")
public class Alimento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "O nome do alimento é obrigatório")
	@Column(nullable = false, length = 100)
	private String nome; // Ex: "Peito de frango grelhado"

	// CORREÇÃO: o frontend trata "quantidade" como texto livre (ex: "150g"),
	// não como um número puro — usar BigDecimal aqui rejeitava (400) todo
	// alimento adicionado, pois o Jackson não conseguia converter "150g" em
	// número. Alinhado ao contrato real do React.
	@NotBlank(message = "A quantidade do alimento é obrigatória")
	private String quantidade; // Ex: "150g"

	// CORREÇÃO: @Positive rejeitava alimentos com 0 caloria (ex: água, café
	// sem açúcar), que são um valor legítimo calculado pelo frontend a partir
	// dos macros. @PositiveOrZero permite 0 sem abrir mão da validação de
	// valores negativos.
	@NotNull(message = "As calorias do alimento são obrigatórias")
	@PositiveOrZero(message = "As calorias do alimento não podem ser negativas")
	private Integer calorias;

	private BigDecimal carboidratos;

	// CORREÇÃO (Contrato com o Frontend): o React envia/lê "proteina" e
	// "gordura" (singular), mas os atributos Java são "proteinas"/"gorduras"
	// (plural) — sem @JsonProperty, o JSON seria serializado com os nomes em
	// português no plural e o frontend leria `undefined` para os dois,
	// quebrando o cálculo de macros na tela mesmo com a requisição OK (200/201).
	@JsonProperty("proteina")
	private BigDecimal proteinas;

	@JsonProperty("gordura")
	private BigDecimal gorduras;

	/**
	 * Relacionamento entre Alimento e Refeicao:
	 * - Muitos alimentos podem pertencer a uma mesma refeição (ManyToOne).
	 * - @JsonBackReference evita o loop infinito de serialização do Jackson,
	 * já que Refeicao possui a lista de Alimentos anotada com @JsonManagedReference.
	 */
	@JsonBackReference
	@ManyToOne
	@JoinColumn(name = "refeicao_id")
	private Refeicao refeicao;

	// Construtor vazio (necessário para JPA)
	public Alimento() {
	}

	// Construtor com parâmetros para facilitar a criação de objetos Alimento
	public Alimento(String nome, String quantidade, Integer calorias, BigDecimal carboidratos,
			BigDecimal proteinas, BigDecimal gorduras) {
		this.nome = nome;
		this.quantidade = quantidade;
		this.calorias = calorias;
		this.carboidratos = carboidratos;
		this.proteinas = proteinas;
		this.gorduras = gorduras;
	}

	// --- GETTERS E SETTERS ---

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

	public String getQuantidade() {
		return quantidade;
	}

	public void setQuantidade(String quantidade) {
		this.quantidade = quantidade;
	}

	public Integer getCalorias() {
		return calorias;
	}

	public void setCalorias(Integer calorias) {
		this.calorias = calorias;
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

	public Refeicao getRefeicao() {
		return refeicao;
	}

	public void setRefeicao(Refeicao refeicao) {
		this.refeicao = refeicao;
	}
}
