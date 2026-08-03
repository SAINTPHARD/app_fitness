package com.appfitness.model.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.appfitness.model.enums.RefeicaoStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Classe de entidade para representar uma Refeição no sistema.
 * Cada Refeição pertence a um único Usuário e possui vários Alimentos.
 */
@Entity
@Table(name = "refeicoes")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Refeicao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	/**
	 * Contrato com o Frontend: o React lê "nome" e "data" (ver `Dieta/utils/historicoDiario.js`, 
	 * `CartaoRefeicao.jsx`, etc.), não "nomeRefeicao"/"dataRefeicao" — @JsonProperty faz o 
	 * Java manter o nome de atributo/coluna em português completo, mas serializar/desserializar 
	 * no JSON com o nome que o frontend já espera.
	 * 
	 */
	@NotBlank(message = "O nome da refeição é obrigatório")
	@Column(nullable = false, length = 100)
	@JsonProperty("nome")
	private String nomeRefeicao; // Ex: "Café da manhã"

	@NotNull(message = "A data da refeição é obrigatória")
	@Column(nullable = false)
	@JsonProperty("data")
	private LocalDate dataRefeicao;

	
	/**
	 * O horário da refeição, representado como uma String no formato "HH:mm".
	 * Exemplo: "08:00" para 8 horas da manhã.
	 * 
	 * O valor é armazenado como String no banco de dados, com tamanho máximo de 5 caracteres.
	 */
	@Column(length = 5)
	private String horario; // Ex: "08:00"
	
	/**
	 * O status da refeição, representado pelo enum RefeicaoStatus.
	 * - PENDENTE: A refeição ainda não foi concluída.
	 * - CONCLUIDA: A refeição foi concluída.
	 * 
	 * O valor é armazenado como String no banco de dados, com tamanho máximo de 20 caracteres.
	 */
	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private RefeicaoStatus status = RefeicaoStatus.PENDENTE;

	@ManyToOne
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	/**
	 * Relacionamento entre Refeicao e Alimento:
	 * - Uma refeição pode ter vários alimentos (OneToMany).
	 * - CascadeType.ALL propaga as operações de persistência/exclusão para os alimentos.
	 * - orphanRemoval = true remove o Alimento do banco quando ele é removido da lista.
	 * - O loop infinito de serialização já é cortado pelo @JsonIgnore em Alimento.refeicao;
	 *   não é preciso @JsonManagedReference/@JsonBackReference aqui (evita o par
	 *   incompleto que gera "Cannot handle managed/back reference").
	 */
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

	public RefeicaoStatus getStatus() {
		return status;
	}

	public void setStatus(RefeicaoStatus status) {
		this.status = status;
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

	/**
	 * Total de calorias da Refeição, somado sob demanda a partir dos Alimentos
	 * atuais — nunca persistido em coluna própria, então não existe o risco de
	 * ficar "dessincronizado" do que está de fato na lista de alimentos (ex:
	 * um UPDATE direto no banco esquecendo de recalcular). `@Transient` deixa
	 * explícito para o Hibernate que este getter não mapeia nenhuma coluna;
	 * o Jackson ainda serializa normalmente como `"totalCalorias"` no JSON.
	 */
	@Transient
	public int getTotalCalorias() {
		if (alimentos == null) {
			return 0;
		}
		return alimentos.stream()
				.mapToInt(alimento -> alimento.getCalorias() != null ? alimento.getCalorias() : 0)
				.sum();
	}
}
