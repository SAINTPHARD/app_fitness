package com.appfitness.dto.relatorio;
import java.time.LocalDate;
import java.util.List;
public record RelatorioResponseDTO(int periodoDias, LocalDate inicio, LocalDate fim,
        MetricasRelatorioDTO atual, MetricasRelatorioDTO anterior,
        List<RelatorioDiaDTO> serie, List<VolumeGrupoDTO> volumePorGrupo) {}
