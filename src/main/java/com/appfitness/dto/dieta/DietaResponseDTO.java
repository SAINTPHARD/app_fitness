package com.appfitness.dto.dieta;

public class DietaResponseDTO {

    private Long id;
    private String descricao;
    private Integer calorias;

    public DietaResponseDTO() {
    }

    public DietaResponseDTO(Long id, String descricao, Integer calorias) {
        this.id = id;
        this.descricao = descricao;
        this.calorias = calorias;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
