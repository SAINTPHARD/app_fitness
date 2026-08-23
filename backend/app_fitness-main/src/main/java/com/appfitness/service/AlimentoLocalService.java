package com.appfitness.service;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.appfitness.dto.alimento.AlimentoBuscaResponseDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

@Service
public class AlimentoLocalService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AlimentoLocalService.class);
    private static final String CAMINHO_ARQUIVO = "data/alimentos.json";
    private static final double ML_POR_COPO = 250.0;
    private static final Pattern PORCAO = Pattern.compile(
            "(?i)(\\d+(?:[.,]\\d+)?)\\s*(ml\\.?|mililitros?|l|litros?|copos?|kg|g|unidades?|un|fatias?|colheres?)?");
    private static final Pattern PALAVRAS_LIGACAO = Pattern.compile("\\b(?:de|da|do|das|dos|com|e)\\b");

    private final ObjectMapper objectMapper;
    private List<AlimentoJsonDTO> catalogoEmMemoria = List.of();

    public AlimentoLocalService() {
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Carrega o catálogo local do arquivo JSON para a memória RAM na inicialização.
     */
    @PostConstruct
    public void carregarCatalogo() {
        try (InputStream entrada = new ClassPathResource(CAMINHO_ARQUIVO).getInputStream()) {
            // Lê o envelope principal do JSON que contém a propriedade "foods"
            EnvelopeJsonDTO envelope = objectMapper.readValue(entrada, EnvelopeJsonDTO.class);
            
            List<AlimentoJsonDTO> todosAlimentos = envelope.foods() != null ? envelope.foods() : List.of();

            // Filtra apenas os alimentos ativos
            this.catalogoEmMemoria = todosAlimentos.stream()
                    .filter(alimento -> alimento.active() == null || alimento.active())
                    .toList();

            LOGGER.info("✅ Catálogo local de alimentos carregado com sucesso: {} itens.", catalogoEmMemoria.size());
        } catch (Exception e) {
            LOGGER.error("❌ Erro ao carregar o arquivo {}: {}", CAMINHO_ARQUIVO, e.getMessage());
            this.catalogoEmMemoria = List.of();
        }
    }

    /**
     * Busca alimentos na memória RAM por nome ou apelido (aliases).
     */
    public List<AlimentoBuscaResponseDTO> buscarAlimentosOffline(String query) {
        if (query == null || query.isBlank() || catalogoEmMemoria.isEmpty()) {
            return List.of();
        }

        List<TermoBusca> termosBusca = extrairTermosBusca(query);
        if (termosBusca.isEmpty()) {
            return List.of();
        }

        return catalogoEmMemoria.stream()
                .map(alimento -> termosBusca.stream()
                        .filter(termo -> contemTermo(alimento, termo.nome()))
                        .findFirst()
                        .map(termo -> converterParaDTO(alimento, termo.porcao())))
                .flatMap(Optional::stream)
                .toList();
    }

    private List<TermoBusca> extrairTermosBusca(String query) {
        String texto = normalizarTexto(query);
        return Arrays.stream(texto.split("\\s+e\\s+"))
                .map(this::extrairTermoBusca)
                .filter(termo -> !termo.nome().isBlank())
                .toList();
    }

    private TermoBusca extrairTermoBusca(String trecho) {
        Matcher matcher = PORCAO.matcher(trecho);
        PorcaoSolicitada porcao = matcher.find() && matcher.group(2) != null
                ? criarPorcao(Double.parseDouble(matcher.group(1).replace(',', '.')), matcher.group(2))
                : null;
        String nome = PORCAO.matcher(trecho).replaceAll(" ");
        nome = PALAVRAS_LIGACAO.matcher(nome).replaceAll(" ").trim().replaceAll("\\s+", " ");
        return new TermoBusca(singularizarTermo(nome), porcao);
    }

    private PorcaoSolicitada criarPorcao(double quantidade, String unidadeInformada) {
        String unidade = unidadeInformada.toLowerCase(Locale.ROOT).replace(".", "");
        if (unidade.startsWith("mililitro")) unidade = "ml";
        if (unidade.startsWith("litro")) unidade = "l";
        if (unidade.startsWith("copo")) return new PorcaoSolicitada(quantidade * ML_POR_COPO, "ml", formatar(quantidade) + (quantidade == 1 ? " copo" : " copos"));
        if (unidade.equals("l")) return new PorcaoSolicitada(quantidade * 1000.0, "ml", formatar(quantidade) + "l");
        if (unidade.equals("kg")) return new PorcaoSolicitada(quantidade * 1000.0, "g", formatar(quantidade) + "kg");
        return new PorcaoSolicitada(quantidade, unidade, formatar(quantidade) + unidade);
    }

    private String singularizarTermo(String termo) {
        return termo.length() > 3 && termo.endsWith("s") ? termo.substring(0, termo.length() - 1) : termo;
    }

    private String normalizarTexto(String valor) {
        String semAcentos = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcentos.toLowerCase(Locale.ROOT).trim();
    }

    private boolean contemTermo(AlimentoJsonDTO alimento, String termo) {
        // Procura no nome principal
        if (alimento.name() != null && normalizarTexto(alimento.name()).contains(termo)) {
            return true;
        }
        // Procura nos apelidos (aliases) se existirem
        if (alimento.aliases() != null) {
            return alimento.aliases().stream()
                    .filter(alias -> alias != null)
                    .anyMatch(alias -> normalizarTexto(alias).contains(termo));
        }
        return false;
    }

    private AlimentoBuscaResponseDTO converterParaDTO(AlimentoJsonDTO alimento, PorcaoSolicitada solicitada) {
        NutrientesJsonDTO nut = alimento.nutrients();
        PorcaoJsonDTO porcao = alimento.serving();
        double quantidade = solicitada != null ? solicitada.quantidadeBase() : porcao != null && porcao.amount() != null ? porcao.amount() : 100.0;
        String unidade = solicitada != null ? solicitada.unidadeBase() : porcao != null && porcao.unit() != null ? porcao.unit().toLowerCase(Locale.ROOT) : "g";
        String porcaoStr = solicitada != null ? solicitada.formatada() : formatar(quantidade) + unidade;
        double gramas;
        if (unidade.equals("ml")) {
            gramas = quantidade * (alimento.densityGPerMl() != null ? alimento.densityGPerMl() : 1.0);
        } else if (unidade.startsWith("unidade") || unidade.equals("un") || unidade.startsWith("fatia") || unidade.startsWith("colher")) {
            gramas = quantidade * (porcao != null && porcao.amount() != null ? porcao.amount() : 100.0);
        } else {
            gramas = quantidade;
        }
        double fator = gramas / 100.0;

        return new AlimentoBuscaResponseDTO(
                alimento.name(),
                porcaoStr,
                escalar(nut != null ? nut.caloriesKcal() : null, fator),
                escalar(nut != null ? nut.proteinG() : null, fator),
                escalar(nut != null ? nut.carbohydrateG() : null, fator),
                escalar(nut != null ? nut.fatG() : null, fator)
        );
    }

    private double escalar(Double valor, double fator) {
        return valor == null ? 0.0 : Math.round(valor * fator * 100.0) / 100.0;
    }

    private String formatar(double valor) {
        return valor == Math.rint(valor) ? Long.toString((long) valor) : Double.toString(valor);
    }

    // =========================================================================
    // Registros (Records) internos para mapear perfeitamente o seu JSON estruturado
    // =========================================================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EnvelopeJsonDTO(List<AlimentoJsonDTO> foods) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AlimentoJsonDTO(
            String name,
            List<String> aliases,
            PorcaoJsonDTO serving,
            NutrientesJsonDTO nutrients,
            Double densityGPerMl,
            Boolean active
    ) {}

    private record TermoBusca(String nome, PorcaoSolicitada porcao) {}
    private record PorcaoSolicitada(double quantidadeBase, String unidadeBase, String formatada) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record PorcaoJsonDTO(Double amount, String unit) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record NutrientesJsonDTO(
            Double caloriesKcal,
            Double proteinG,
            Double carbohydrateG,
            Double fatG
    ) {}
}
