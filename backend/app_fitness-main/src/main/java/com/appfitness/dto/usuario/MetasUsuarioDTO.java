package com.appfitness.dto.usuario;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class MetasUsuarioDTO {

    @NotNull(message = "A meta de calorias é obrigatória")
    @Min(value = 1, message = "A meta de calorias deve ser maior que zero")
    @Max(value = 10000, message = "A meta de calorias deve ser menor ou igual a 10000 kcal")
    private Integer calorias;

    @NotNull(message = "A meta de proteínas é obrigatória")
    @Min(value = 0, message = "A meta de proteínas não pode ser negativa")
    @Max(value = 1000, message = "A meta de proteínas deve ser menor ou igual a 1000 g")
    private Integer proteinas;

    @NotNull(message = "A meta de carboidratos é obrigatória")
    @Min(value = 0, message = "A meta de carboidratos não pode ser negativa")
    @Max(value = 1500, message = "A meta de carboidratos deve ser menor ou igual a 1500 g")
    private Integer carboidratos;

    @NotNull(message = "A meta de gorduras é obrigatória")
    @Min(value = 0, message = "A meta de gorduras não pode ser negativa")
    @Max(value = 500, message = "A meta de gorduras deve ser menor ou igual a 500 g")
    private Integer gorduras;

    @NotNull(message = "A meta de água é obrigatória")
    @Min(value = 250, message = "A meta de água deve ser maior ou igual a 250 ml")
    @Max(value = 10000, message = "A meta de água deve ser menor ou igual a 10000 ml")
    private Integer aguaMl;

    public Integer getCalorias() {
        return calorias;
    }

    public void setCalorias(Integer calorias) {
        this.calorias = calorias;
    }

    public Integer getProteinas() {
        return proteinas;
    }

    public void setProteinas(Integer proteinas) {
        this.proteinas = proteinas;
    }

    public Integer getCarboidratos() {
        return carboidratos;
    }

    public void setCarboidratos(Integer carboidratos) {
        this.carboidratos = carboidratos;
    }

    public Integer getGorduras() {
        return gorduras;
    }

    public void setGorduras(Integer gorduras) {
        this.gorduras = gorduras;
    }

    public Integer getAguaMl() {
        return aguaMl;
    }

    public void setAguaMl(Integer aguaMl) {
        this.aguaMl = aguaMl;
    }
}
