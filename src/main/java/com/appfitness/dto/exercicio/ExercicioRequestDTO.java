package com.appfitness.dto.exercicio;

import jakarta.validation.constraints.NotBlank;

public class ExercicioRequestDTO {

    @NotBlank
    private String nome;

    private Integer series;
    private Integer repeticoes;
    private Double carga;
    private Long treinoId;

    public ExercicioRequestDTO() {
    }

    public ExercicioRequestDTO(String nome, Integer series, Integer repeticoes, Double carga, Long treinoId) {
        this.nome = nome;
        this.series = series;
        this.repeticoes = repeticoes;
        this.carga = carga;
        this.treinoId = treinoId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getSeries() {
        return series;
    }

    public void setSeries(Integer series) {
        this.series = series;
    }

    public Integer getRepeticoes() {
        return repeticoes;
    }

    public void setRepeticoes(Integer repeticoes) {
        this.repeticoes = repeticoes;
    }

    public Double getCarga() {
        return carga;
    }

    public void setCarga(Double carga) {
        this.carga = carga;
    }

    public Long getTreinoId() {
        return treinoId;
    }

    public void setTreinoId(Long treinoId) {
        this.treinoId = treinoId;
    }
}
