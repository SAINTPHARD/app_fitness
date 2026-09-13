package com.appfitness.dto.evolucao;

import java.time.LocalDate;
import com.appfitness.model.entity.FotoProgresso;

public record FotoProgressoDTO(Long id, LocalDate data, String pose, String descricao) {
    public static FotoProgressoDTO fromEntity(FotoProgresso foto) {
        return new FotoProgressoDTO(foto.getId(), foto.getData(), foto.getPose(), foto.getDescricao());
    }
}
