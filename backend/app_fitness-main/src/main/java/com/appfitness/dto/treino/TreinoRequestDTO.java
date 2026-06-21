package com.appfitness.dto.treino;

import jakarta.validation.constraints.NotBlank;

public class TreinoRequestDTO {

    @NotBlank
    private String nome;

    private String descricao;
    private Long usuarioId;

    public TreinoRequestDTO() {
    }

    public TreinoRequestDTO(String nome, String descricao, Long usuarioId) {
        this.nome = nome;
        this.descricao = descricao;
        this.usuarioId = usuarioId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}
