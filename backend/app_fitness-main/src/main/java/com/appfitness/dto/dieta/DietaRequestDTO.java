package com.appfitness.dto.dieta;

import jakarta.validation.constraints.NotBlank;

public class DietaRequestDTO {

    @NotBlank
    private String descricao;

    private Integer calorias;
    private Long usuarioId;

    public DietaRequestDTO() {
    }

    public DietaRequestDTO(String descricao, Integer calorias, Long usuarioId) {
        this.descricao = descricao;
        this.calorias = calorias;
        this.usuarioId = usuarioId;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getCalorias() {
        return calorias;
    }

    public void setCalorias(Integer calorias) {
        this.calorias = calorias;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}
