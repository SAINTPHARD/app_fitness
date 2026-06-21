package com.appfitness.dto.exercicio;

public class ExercicioResponseDTO {

    private Long id;
    private String nome;
    private Integer series;
    private Integer repeticoes;
    private Double carga;

    public ExercicioResponseDTO() {
    }

    public ExercicioResponseDTO(Long id, String nome, Integer series, Integer repeticoes, Double carga) {
        this.id = id;
        this.nome = nome;
        this.series = series;
        this.repeticoes = repeticoes;
        this.carga = carga;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
