package com.appfitness.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.appfitness.model.enums.SerieStatus;
import com.appfitness.model.enums.SerieTipo;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Uma série executada (ou em execução) de um Exercício, dentro de uma
 * SessaoTreino. Fonte única de verdade de carga/repetições históricas —
 * `Exercicio` guarda só o planejado (séries/reps alvo), nunca o realizado.
 *
 * `carga`/`repeticoes` são NULÁVEIS de propósito: distingue "sem carga
 * registrada ainda" (null, série pendente) de "carga zero" (0, valor real —
 * ex: exercício com peso corporal) — regra de negócio #12 da refatoração.
 */
@Entity
@Table(name = "series")
public class Serie {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "sessao_id", nullable = false)
	@JsonIgnore
	private SessaoTreino sessao;

	// Sem @JsonIgnore: o frontend precisa saber a qual Exercicio a série
	// pertence ao consumir a lista de séries de uma sessão inteira.
	@ManyToOne
	@JoinColumn(name = "exercicio_id", nullable = false)
	private Exercicio exercicio;

	@NotNull
	@Column(name = "ordem_exercicio", nullable = false)
	private Integer ordemExercicio;

	@NotNull
	@Column(name = "numero_serie", nullable = false)
	private Integer numeroSerie;

	@PositiveOrZero(message = "A carga não pode ser negativa")
	private BigDecimal carga;

	@PositiveOrZero(message = "As repetições não podem ser negativas")
	private Integer repeticoes;

	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private SerieTipo tipo = SerieTipo.NORMAL;

	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private SerieStatus status = SerieStatus.PENDENTE;

	private LocalDateTime horarioInicio;
	private LocalDateTime horarioConclusao;

	@Column(name = "duracao_descanso_segundos")
	private Integer duracaoDescansoSegundos;

	/**
	 * Chave de idempotência gerada no cliente — reservado para a fase de
	 * sincronização offline (fase 4 do plano), já modelado agora para não
	 * exigir outra migração depois. Único quando presente; nulo em séries
	 * criadas normalmente online.
	 */
	@Column(name = "idempotency_key", unique = true)
	private String idempotencyKey;

	public Serie() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public SessaoTreino getSessao() {
		return sessao;
	}

	public void setSessao(SessaoTreino sessao) {
		this.sessao = sessao;
	}

	public Exercicio getExercicio() {
		return exercicio;
	}

	public void setExercicio(Exercicio exercicio) {
		this.exercicio = exercicio;
	}

	public Integer getOrdemExercicio() {
		return ordemExercicio;
	}

	public void setOrdemExercicio(Integer ordemExercicio) {
		this.ordemExercicio = ordemExercicio;
	}

	public Integer getNumeroSerie() {
		return numeroSerie;
	}

	public void setNumeroSerie(Integer numeroSerie) {
		this.numeroSerie = numeroSerie;
	}

	public BigDecimal getCarga() {
		return carga;
	}

	public void setCarga(BigDecimal carga) {
		this.carga = carga;
	}

	public Integer getRepeticoes() {
		return repeticoes;
	}

	public void setRepeticoes(Integer repeticoes) {
		this.repeticoes = repeticoes;
	}

	public SerieTipo getTipo() {
		return tipo;
	}

	public void setTipo(SerieTipo tipo) {
		this.tipo = tipo;
	}

	public SerieStatus getStatus() {
		return status;
	}

	public void setStatus(SerieStatus status) {
		this.status = status;
	}

	public LocalDateTime getHorarioInicio() {
		return horarioInicio;
	}

	public void setHorarioInicio(LocalDateTime horarioInicio) {
		this.horarioInicio = horarioInicio;
	}

	public LocalDateTime getHorarioConclusao() {
		return horarioConclusao;
	}

	public void setHorarioConclusao(LocalDateTime horarioConclusao) {
		this.horarioConclusao = horarioConclusao;
	}

	public Integer getDuracaoDescansoSegundos() {
		return duracaoDescansoSegundos;
	}

	public void setDuracaoDescansoSegundos(Integer duracaoDescansoSegundos) {
		this.duracaoDescansoSegundos = duracaoDescansoSegundos;
	}

	public String getIdempotencyKey() {
		return idempotencyKey;
	}

	public void setIdempotencyKey(String idempotencyKey) {
		this.idempotencyKey = idempotencyKey;
	}
}
