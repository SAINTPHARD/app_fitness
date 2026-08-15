package com.appfitness.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Representa um registro de consumo de água de um usuário.
 * * Responsável por armazenar informações sobre a quantidade de água consumida, 
 * a data e hora do registro, a origem do registro e o usuário associado.
 */
@Entity // Avisa ao Spring/Hibernate que esta classe vai virar uma tabela no PostgreSQL
@Table(name = "agua_registros") // Nome exato da tabela no banco de dados
@JsonIgnoreProperties(ignoreUnknown = true) // Ignora campos extras enviados no JSON que não existam nesta classe
public class AguaRegistro {

    // =====================================================
    // CHAVE PRIMÁRIA
    // =====================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // O PostgreSQL vai gerar o ID automaticamente (Auto-Incremento)
    private Long id;

    // =====================================================
    // ATRIBUTOS E VALIDAÇÕES (JAKARTA VALIDATION)
    // =====================================================
    
    // Protege a API contra valores vazios, negativos ou absurdos (ex: tentar beber 10 litros num só copo)
    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 1, message = "A quantidade de água deve ser maior que zero")
    @Max(value = 5000, message = "Um lançamento de água não pode exceder 5000 ml")
    @Column(name = "quantidade_ml", nullable = false)
    private Integer quantidadeMl;

    // Usado para agrupar a água por dia no Dashboard (ex: água tomada "hoje")
    @NotNull(message = "O dia de referência é obrigatório")
    @Column(name = "dia_referencia", nullable = false)
    private LocalDate diaReferencia;

    // Data e hora EXATA do momento em que o usuário clicou no botão (útil para auditoria)
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    // Identifica se o usuário digitou ("manual") ou se veio de um smartwatch/app externo ("automatico")
    @Column(nullable = false, length = 30)
    private String origem = "manual";

    // Data técnica de criação da linha no banco de dados
    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    // =====================================================
    // RELACIONAMENTOS (FOREIGN KEYS)
    // =====================================================
    
    @JsonIgnore // CRÍTICO: Impede o "Loop Infinito" ao transformar em JSON (Agua chama Usuario, que chama Agua...)
    @ManyToOne(fetch = FetchType.LAZY) // LAZY: Só busca o Usuário no banco se você usar "getUsuario()". Poupa muita memória!
    @JoinColumn(name = "usuario_id", nullable = false) // Nome da coluna da chave estrangeira na tabela
    private Usuario usuario;

    // =====================================================
    // GATILHOS (LIFECYCLE CALLBACKS)
    // =====================================================
    
    /**
     * Este método é executado automaticamente pelo Hibernate UMA FRAÇÃO DE SEGUNDO ANTES
     * de fazer o comando "INSERT" no banco de dados. Ideal para preencher dados padrão.
     */
    @PrePersist
    public void prePersist() {
        LocalDateTime agora = LocalDateTime.now();
        
        // Se o frontend não enviar a hora exata, o backend assume o controle e coloca a hora atual
        if (dataHora == null) {
            dataHora = agora;
        }
        // Sempre preenche quando o registro foi criado no sistema
        if (criadoEm == null) {
            criadoEm = agora;
        }
        // Define o padrão como "manual" se vier vazio
        if (origem == null || origem.isBlank()) {
            origem = "manual";
        }
    }

    // =====================================================
    // GETTERS E SETTERS 
    // (Permitem que o Spring e o código acessem/mudem os dados privados)
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantidadeMl() {
        return quantidadeMl;
    }

    public void setQuantidadeMl(Integer quantidadeMl) {
        this.quantidadeMl = quantidadeMl;
    }

    public LocalDate getDiaReferencia() {
        return diaReferencia;
    }

    public void setDiaReferencia(LocalDate diaReferencia) {
        this.diaReferencia = diaReferencia;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getOrigem() {
        return origem;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
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
     * Compara se dois registros de água são iguais baseando-se EXCLUSIVAMENTE no ID.
     * Isso impede problemas quando as entidades são guardadas em listas (Collections) do Java.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AguaRegistro that = (AguaRegistro) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}