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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Representa o registro visual da evolução do usuário (Fotos de Progresso).
 * * Armazena a data da foto e o caminho/conteúdo da imagem (URL ou Base64),
 * vinculando sempre ao usuário que fez o upload.
 */
@Entity
@Table(name = "evolucao_fotos")
@JsonIgnoreProperties(ignoreUnknown = true) // Ignora lixo extra que venha no JSON
public class FotoProgresso {

    // =====================================================
    // CHAVE PRIMÁRIA
    // =====================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // ATRIBUTOS E VALIDAÇÕES (JAKARTA VALIDATION)
    // =====================================================

    // Data em que a foto representa a evolução (útil para ordenar a galeria no Front)
    @NotNull(message = "A data do registro é obrigatória")
    @Column(name = "data_registro", nullable = false)
    private LocalDate data;

    // @NotBlank impede que enviem strings vazias ("   ").
    // columnDefinition = "TEXT" é vital aqui, pois Base64 ou URLs longas ultrapassam o limite de 255 caracteres do VARCHAR padrão.
    @NotBlank(message = "A imagem é obrigatória")
    @Column(name = "src", nullable = false, columnDefinition = "TEXT")
    private String src;

    // =====================================================
    // RELACIONAMENTOS (FOREIGN KEYS)
    // =====================================================

    @JsonIgnore // Evita o loop infinito (Foto -> Usuário -> Foto...) na hora de devolver o JSON
    @ManyToOne(fetch = FetchType.LAZY) // LAZY: Poupa memória. Só carrega o Usuário se chamarmos getUsuario()
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // =====================================================
    // GATILHOS (LIFECYCLE CALLBACKS)
    // =====================================================

    /**
     * Garante que a data nunca seja nula no banco de dados. 
     * Se o frontend não enviar a data da foto, assume-se que foi tirada hoje.
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

    public String getSrc() {
        return src;
    }

    public void setSrc(String src) {
        this.src = src;
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

    /**
     * Compara a igualdade dos objetos APENAS pelo ID.
     * Previne bugs críticos de "LazyInitializationException" se esta entidade for jogada dentro de um Set<> ou List<> do Java.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FotoProgresso that = (FotoProgresso) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}