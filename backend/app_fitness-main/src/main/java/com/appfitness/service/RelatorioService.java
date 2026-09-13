package com.appfitness.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.dto.relatorio.MetricasRelatorioDTO;
import com.appfitness.dto.relatorio.RelatorioDiaDTO;
import com.appfitness.dto.relatorio.RelatorioResponseDTO;
import com.appfitness.dto.relatorio.VolumeGrupoDTO;
import com.appfitness.model.entity.PesoRegistro;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.AguaRegistroRepository;
import com.appfitness.repository.PesoRegistroRepository;
import com.appfitness.repository.RefeicaoRepository;
import com.appfitness.repository.SerieRepository;
import com.appfitness.repository.SessaoTreinoRepository;

@Service
public class RelatorioService {
    private final RefeicaoRepository refeicoes;
    private final AguaRegistroRepository agua;
    private final PesoRegistroRepository pesos;
    private final SessaoTreinoRepository sessoes;
    private final SerieRepository series;

    public RelatorioService(RefeicaoRepository refeicoes, AguaRegistroRepository agua,
            PesoRegistroRepository pesos, SessaoTreinoRepository sessoes, SerieRepository series) {
        this.refeicoes = refeicoes; this.agua = agua; this.pesos = pesos; this.sessoes = sessoes; this.series = series;
    }

    @Transactional(readOnly = true)
    public RelatorioResponseDTO gerar(Usuario usuario, int dias) {
        if (dias != 7 && dias != 30 && dias != 90) throw new IllegalArgumentException("Período deve ser 7, 30 ou 90 dias.");
        LocalDate fim = LocalDate.now();
        LocalDate inicio = fim.minusDays(dias - 1L);
        LocalDate inicioAnterior = inicio.minusDays(dias);
        LocalDate fimAnterior = inicio.minusDays(1);
        Long usuarioId = usuario.getId();

        Map<LocalDate, Long> calorias = mapaLong(refeicoes.somarCaloriasPorDia(usuarioId, inicioAnterior, fim));
        Map<LocalDate, Long> hidratacao = mapaLong(agua.somarPorDia(usuarioId, inicioAnterior, fim));
        Map<LocalDate, Double> pesoPorDia = new LinkedHashMap<>();
        pesos.findByUsuarioIdAndDataBetweenOrderByDataAsc(usuarioId, inicioAnterior, fim)
                .forEach(peso -> pesoPorDia.put(peso.getData(), peso.getPeso()));
        Map<LocalDate, long[]> sessoesPorDia = new LinkedHashMap<>();
        for (Object[] linha : sessoes.resumirSessoesPorDia(usuarioId, inicioAnterior, fim)) {
            sessoesPorDia.put((LocalDate) linha[0], new long[]{numero(linha[1]), numero(linha[2])});
        }
        Map<LocalDate, long[]> aderenciaPorDia = new LinkedHashMap<>();
        for (Object[] linha : series.resumirAderencia(usuarioId, inicioAnterior, fim)) {
            aderenciaPorDia.put((LocalDate) linha[0], new long[]{numero(linha[1]), numero(linha[2])});
        }
        Map<LocalDate, Map<String, Double>> volumePorDia = new LinkedHashMap<>();
        for (Object[] linha : series.somarVolumePorGrupo(usuarioId, inicioAnterior, fim)) {
            volumePorDia.computeIfAbsent((LocalDate) linha[0], chave -> new LinkedHashMap<>())
                    .merge(String.valueOf(linha[1]), decimal(linha[2]), Double::sum);
        }

        List<RelatorioDiaDTO> serieAtual = montarSerie(inicio, fim, calorias, hidratacao, pesoPorDia, sessoesPorDia);
        MetricasRelatorioDTO atual = calcularMetricas(inicio, fim, dias, calorias, hidratacao, pesoPorDia, sessoesPorDia, aderenciaPorDia, volumePorDia);
        MetricasRelatorioDTO anterior = calcularMetricas(inicioAnterior, fimAnterior, dias, calorias, hidratacao, pesoPorDia, sessoesPorDia, aderenciaPorDia, volumePorDia);
        Map<String, Double> volumeGrupo = new LinkedHashMap<>();
        volumePorDia.forEach((data, grupos) -> { if (!data.isBefore(inicio)) grupos.forEach((grupo, valor) -> volumeGrupo.merge(grupo, valor, Double::sum)); });
        List<VolumeGrupoDTO> volumes = volumeGrupo.entrySet().stream().map(e -> new VolumeGrupoDTO(e.getKey(), arredondar(e.getValue(), 1))).toList();
        return new RelatorioResponseDTO(dias, inicio, fim, atual, anterior, serieAtual, volumes);
    }

    private List<RelatorioDiaDTO> montarSerie(LocalDate inicio, LocalDate fim, Map<LocalDate, Long> calorias,
            Map<LocalDate, Long> agua, Map<LocalDate, Double> pesos, Map<LocalDate, long[]> sessoes) {
        List<RelatorioDiaDTO> resultado = new ArrayList<>();
        for (LocalDate data = inicio; !data.isAfter(fim); data = data.plusDays(1)) {
            long[] treino = sessoes.getOrDefault(data, new long[2]);
            resultado.add(new RelatorioDiaDTO(data, calorias.getOrDefault(data, 0L), agua.getOrDefault(data, 0L), pesos.get(data), treino[0], treino[1]));
        }
        return resultado;
    }

    private MetricasRelatorioDTO calcularMetricas(LocalDate inicio, LocalDate fim, int dias,
            Map<LocalDate, Long> calorias, Map<LocalDate, Long> agua, Map<LocalDate, Double> pesos,
            Map<LocalDate, long[]> sessoes, Map<LocalDate, long[]> aderencia, Map<LocalDate, Map<String, Double>> volumes) {
        long somaKcal = 0, diasKcal = 0, somaAgua = 0, diasAgua = 0, concluidas = 0, totalSeries = 0, seriesConcluidas = 0;
        double volume = 0;
        List<Double> pontosPeso = new ArrayList<>();
        for (LocalDate data = inicio; !data.isAfter(fim); data = data.plusDays(1)) {
            long kcal = calorias.getOrDefault(data, 0L); if (kcal > 0) { somaKcal += kcal; diasKcal++; }
            long ml = agua.getOrDefault(data, 0L); if (ml > 0) { somaAgua += ml; diasAgua++; }
            if (pesos.containsKey(data)) pontosPeso.add(pesos.get(data));
            concluidas += sessoes.getOrDefault(data, new long[2])[1];
            long[] ad = aderencia.getOrDefault(data, new long[2]); totalSeries += ad[0]; seriesConcluidas += ad[1];
            volume += volumes.getOrDefault(data, Map.of()).values().stream().mapToDouble(Double::doubleValue).sum();
        }
        Double variacao = pontosPeso.size() < 2 ? null : arredondar(pontosPeso.get(pontosPeso.size() - 1) - pontosPeso.get(0), 1);
        return new MetricasRelatorioDTO(diasKcal == 0 ? 0 : Math.round((double) somaKcal / diasKcal),
                diasAgua == 0 ? 0 : Math.round((double) somaAgua / diasAgua), variacao, concluidas,
                arredondar(concluidas / (dias / 7.0), 1), totalSeries == 0 ? 0 : arredondar(seriesConcluidas * 100.0 / totalSeries, 1), arredondar(volume, 1));
    }

    private Map<LocalDate, Long> mapaLong(List<Object[]> linhas) {
        Map<LocalDate, Long> mapa = new LinkedHashMap<>();
        linhas.forEach(linha -> mapa.put((LocalDate) linha[0], numero(linha[1]))); return mapa;
    }
    private long numero(Object valor) { return valor == null ? 0 : ((Number) valor).longValue(); }
    private double decimal(Object valor) { return valor == null ? 0 : valor instanceof BigDecimal b ? b.doubleValue() : ((Number) valor).doubleValue(); }
    private double arredondar(double valor, int casas) { double fator = Math.pow(10, casas); return Math.round(valor * fator) / fator; }
}
