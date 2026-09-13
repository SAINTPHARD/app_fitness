package com.appfitness.dto.relatorio;
import java.time.LocalDate;
public record RelatorioDiaDTO(LocalDate data, long calorias, long aguaMl, Double peso, long sessoes, long sessoesConcluidas) {}
