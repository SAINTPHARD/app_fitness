package com.appfitness.model.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Classe de entidade para representar uma Refeição no sistema.
 * Cada Refeição pertence a um único Usuário e possui vários Alimentos.
 */
@Entity
@Table(name = "refeicoes")
public class Refeicao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// CORREÇÃO (Contrato com o Frontend): o React lê "nome" e "data" (ver
	// `Dieta/utils/historicoDiario.js`, `CartaoRefeicao.jsx`, etc.), não
	// "nomeRefeicao"/"dataRefeicao" — @JsonProperty faz o Java manter o nome
	// de atributo/coluna em português completo, mas serializar/desserializar
	// no JSON com o nome que o frontend já espera.
	@NotBlank(message = "O nome da refeição é obrigatório")
	@Column(nullable = false, length = 100)
	@JsonProperty("nome")
	private String nomeRefeicao; // Ex: "Café da manhã"

	@NotNull(message = "A data da refeição é obrigatória")
	@Column(nullable = false)
	@JsonProperty("data")
	private LocalDate dataRefeicao;

	// CORREÇÃO: este campo não existia — o frontend usa `refeicao.horario`
	// (ex: "08:00") para ordenar e exibir as refeições do dia em toda a
	// aplicação (accordion da Dieta, "Próxima Refeição", histórico). Sem ele,
	// o JSON vindo do backend não tinha essa informação e a ordenação por
	// horário quebrava (comparação com `undefined`).
	@Column(length = 5)
	private String horario; // Ex: "08:00"

	@ManyToOne
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	/**
	 * Relacionamento entre Refeicao e Alimento:
	 * - Uma refeição pode ter vários alimentos (OneToMany).
	 * - CascadeType.ALL propaga as operações de persistência/exclusão para os alimentos.
	 * - orphanRemoval = true remove o Alimento do banco quando ele é removido da lista.
	 * - @JsonManagedReference evita o loop infinito de serialização do Jackson.
	 */
	@JsonManagedReference
	@OneToMany(mappedBy = "refeicao", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Alimento> alimentos = new ArrayList<>();

	// Construtor vazio (necessário para JPA)
	public Refeicao() {
	}

	// Construtor com parâmetros para facilitar a criação de objetos Refeicao
	public Refeicao(String nomeRefeicao, LocalDate dataRefeicao, Usuario usuario) {
		this.nomeRefeicao = nomeRefeicao;
		this.dataRefeicao = dataRefeicao;
		this.usuario = usuario;
	}

	// --- GETTERS E SETTERS ---

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNomeRefeicao() {
		return nomeRefeicao;
	}

	public void setNomeRefeicao(String nomeRefeicao) {
		this.nomeRefeicao = nomeRefeicao;
	}

	public LocalDate getDataRefeicao() {
		return dataRefeicao;
	}

	public void setDataRefeicao(LocalDate dataRefeicao) {
		this.dataRefeicao = dataRefeicao;
	}

	public String getHorario() {
		return horario;
	}

	public void setHorario(String horario) {
		this.horario = horario;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public List<Alimento> getAlimentos() {
		return alimentos;
	}

	public void setAlimentos(List<Alimento> alimentos) {
		this.alimentos = alimentos;
	}
}
