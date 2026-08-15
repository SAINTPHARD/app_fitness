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
 * Representa a evolução das medidas corporais do usuário ao longo do tempo.
 * Garante que exista apenas um registro por usuário por dia.
 */
@Entity
@Table(
        name = "evolucao_medidas",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_evolucao_medida_usuario_data",
                columnNames = {"usuario_id", "data_registro"}
        )
)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedidaCorporal {

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

    // @Positive garante que ninguém envie valores negativos (ex: -5cm de braço)
    // Usamos o tipo Wrapper (Double) em vez do primitivo (double) para permitir valores nulos, 
    // caso o usuário não queira registrar todas as medidas de uma vez.
    
    @Positive(message = "A medida da cintura deve ser um valor positivo")
    private Double cintura;
    
    @Positive(message = "A medida do braço deve ser um valor positivo")
    private Double braco;
    
    @Positive(message = "A medida da perna deve ser um valor positivo")
    private Double perna;
    
    @Positive(message = "O percentual de gordura deve ser um valor positivo")
    private Double gordura;

    // =====================================================
    // RELACIONAMENTOS (FOREIGN KEYS)
    // =====================================================

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY) // LAZY: Otimização de memória (busca apenas quando solicitado)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // =====================================================
    // GATILHOS (LIFECYCLE CALLBACKS)
    // =====================================================

    @PrePersist
    public void prePersist() {
        // Se a data vier nula do frontend, assume o dia de hoje.
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

    public Double getCintura() {
        return cintura;
    }

    public void setCintura(Double cintura) {
        this.cintura = cintura;
    }

    public Double getBraco() {
        return braco;
    }

    public void setBraco(Double braco) {
        this.braco = braco;
    }

    public Double getPerna() {
        return perna;
    }

    public void setPerna(Double perna) {
        this.perna = perna;
    }

    public Double getGordura() {
        return gordura;
    }

    public void setGordura(Double gordura) {
        this.gordura = gordura;
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
        MedidaCorporal that = (MedidaCorporal) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}