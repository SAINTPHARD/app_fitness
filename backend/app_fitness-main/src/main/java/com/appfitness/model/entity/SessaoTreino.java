package com.appfitness.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.appfitness.model.enums.SessaoStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

/**
 * Uma execução real de uma ficha de Treino num dia específico — distinta do
 * Treino em si (que é o plano/ficha reutilizável). Cada (treino, data) tem
 * no máximo uma sessão (constraint única), então reabrir o app no mesmo dia
 * sempre retoma a mesma sessão em vez de criar uma nova.
 */
@Entity
@Table(
		name = "sessoes_treino",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_sessao_treino_data",
				columnNames = {"treino_id", "data"}
		)
)
public class SessaoTreino {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "treino_id", nullable = false)
	@JsonIgnore
	private Treino treino;

	@ManyToOne
	@JoinColumn(name = "usuario_id", nullable = false)
	@JsonIgnore
	private Usuario usuario;

	@NotNull
	@Column(nullable = false)
	private LocalDate data;

	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private SessaoStatus status = SessaoStatus.PENDENTE;

	private LocalDateTime horarioInicio;
	private LocalDateTime horarioFim;

	@OneToMany(mappedBy = "sessao", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Serie> series = new ArrayList<>();

	public SessaoTreino() {
	}

	public SessaoTreino(Treino treino, Usuario usuario, LocalDate data) {
		this.treino = treino;
		this.usuario = usuario;
		this.data = data;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Treino getTreino() {
		return treino;
	}

	public void setTreino(Treino treino) {
		this.treino = treino;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public LocalDate getData() {
		return data;
	}

	public void setData(LocalDate data) {
		this.data = data;
	}

	public SessaoStatus getStatus() {
		return status;
	}

	public void setStatus(SessaoStatus status) {
		this.status = status;
	}

	public LocalDateTime getHorarioInicio() {
		return horarioInicio;
	}

	public void setHorarioInicio(LocalDateTime horarioInicio) {
		this.horarioInicio = horarioInicio;
	}

	public LocalDateTime getHorarioFim() {
		return horarioFim;
	}

	public void setHorarioFim(LocalDateTime horarioFim) {
		this.horarioFim = horarioFim;
	}

	public List<Serie> getSeries() {
		return series;
	}

	public void setSeries(List<Serie> series) {
		this.series = series;
	}
}
