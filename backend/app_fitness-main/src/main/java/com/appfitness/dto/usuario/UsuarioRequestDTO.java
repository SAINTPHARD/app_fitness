package com.appfitness.dto.usuario;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.appfitness.model.enums.Objetivo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UsuarioRequestDTO {

    @NotBlank(message = "é obrigatório")
    @Size(max = 150, message = "deve ter no máximo 150 caracteres")
    private String nome;

    @Email(message = "deve ter um formato válido")
    @NotBlank(message = "é obrigatório")
    @Size(max = 150, message = "deve ter no máximo 150 caracteres")
    private String email;

    @NotBlank(message = "é obrigatória")
    @Size(min = 8, max = 72, message = "deve ter entre 8 e 72 caracteres")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "deve conter pelo menos uma letra e um número"
    )
    private String senha;

    @Positive(message = "deve ser maior que zero")
    private Integer idade;

    @Positive(message = "deve ser maior que zero")
    private Double peso;

    @Positive(message = "deve ser maior que zero")
    private Double altura;

    @Pattern(regexp = "(?i)[MF]", message = "deve ser M ou F")
    private String sexo;

    private Objetivo objetivo;

    public UsuarioRequestDTO() {
    }

    public UsuarioRequestDTO(String nome, String email, String senha, Integer idade, Double peso, Double altura, String sexo, Objetivo objetivo) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.idade = idade;
        this.peso = peso;
        this.altura = altura;
        this.sexo = sexo;
        this.objetivo = objetivo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Integer getIdade() {
        return idade;
    }

    public void setIdade(Integer idade) {
        this.idade = idade;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public Double getAltura() {
        return altura;
    }

    public void setAltura(Double altura) {
        this.altura = altura;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public Objetivo getObjetivo() {
        return objetivo;
    }

    public void setObjetivo(Objetivo objetivo) {
        this.objetivo = objetivo;
    }
}
