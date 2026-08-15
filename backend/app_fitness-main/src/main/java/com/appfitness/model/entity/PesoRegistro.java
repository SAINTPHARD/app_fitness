package com.appfitness.model.entity;

import java.time.LocalDate;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Representa o histórico de peso do usuário (Evolução de Peso).
 * Garante a nível de banco de dados que só exista um registro de peso por dia para cada usuário.
 */
@Entity
@Table(
        name = "evolucao_pesos",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_evolucao_peso_usuario_data",
                columnNames = {"usuario_id", "data_registro"}
        )
)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PesoRegistro {

    // =====================================================
    // CHAVE PRIMÁRIA
    // =====================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // ATRIBUTOS E VALIDAÇÕES (JAKARTA VALIDATION)
    // =====================================================

    @NotNull(message = "A data do registro é obrigatória")
    @Column(name = "data_registro", nullable = false)
    private LocalDate data;

    @NotNull(message = "O peso é obrigatório")
    @Positive(message = "O peso deve ser maior que zero")
    @Column(nullable = false)
    private Double peso;

    // =====================================================
    // RELACIONAMENTOS (FOREIGN KEYS)
    // =====================================================

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY) // LAZY: Otimização crítica de performance para gráficos com muitos dados
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // =====================================================
    // GATILHOS (LIFECYCLE CALLBACKS)
    // =====================================================

    /**
     * Garante que, se a requisição do frontend vier sem data, 
     * o sistema não quebre e assuma automaticamente a data de hoje.
     */
    @PrePersist
    public void prePersist() {
        if (data == null) {
            data = LocalDate.now();
        }
    }

    // =====================================================
    // GETTERS E SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    // =====================================================
    // EQUALS E HASHCODE (BOA PRÁTICA JPA)
    // =====================================================

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PesoRegistro that = (PesoRegistro) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}