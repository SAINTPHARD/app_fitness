package com.appfitness.service;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.appfitness.dto.externo.ExercicioExternoDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

/**
 * Fonte única do catálogo de exercícios: um JSON estático embarcado no jar
 * ({@code resources/data/exercicios.json}), já em português e com GIF de
 * demonstração. Substitui a integração anterior (API Ninjas + tradução via
 * Gemini + cache) — sem chamada de rede, sem rate-limit, sem dependência
 * externa que possa falhar durante uma apresentação.
 *
 * O arquivo é lido e parseado uma única vez na inicialização
 * ({@link PostConstruct}) e mantido em memória; requisições subsequentes só
 * filtram a lista já carregada com Streams — não há necessidade de cache
 * (@Cacheable) porque não há I/O nem chamada externa por requisição.
 */
@Service
public class CatalogoLocalService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CatalogoLocalService.class);
    // Este é o catálogo completo presente no projeto. O exercicios.json atual
    // é uma amostra antiga com apenas 19 itens e deixa vários filtros vazios.
    private static final String CAMINHO_ARQUIVO = "data/catalogo_exercicios_completo.json";
    private static final Map<String, String> ALIASES_MUSCULARES = Map.ofEntries(
            Map.entry("pectorals", "chest"), Map.entry("peitoral", "chest"),
            Map.entry("quads", "quadriceps"), Map.entry("pernas", "quadriceps"),
            Map.entry("posterior", "hamstrings"), Map.entry("femoral", "hamstrings"),
            Map.entry("posterior de coxa", "hamstrings"),
            Map.entry("gluteo", "glutes"), Map.entry("gluteos", "glutes"),
            Map.entry("panturrilha", "calves"), Map.entry("panturrilhas", "calves"),
            Map.entry("lats", "back"), Map.entry("delts", "shoulders"), Map.entry("abs", "core")
    );

    private final ObjectMapper objectMapper;
    private List<ExercicioExternoDTO> catalogoCompleto = List.of();

    public CatalogoLocalService() {
        // Mesmo padrão do GeminiVisionService: instanciamos nosso próprio
        // ObjectMapper (Jackson 2 clássico) em vez de depender de injeção,
        // já que o Spring Boot 4 só auto-configura o ObjectMapper da nova
        // stack Jackson 3 como bean.
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    void carregarCatalogo() {
        try (InputStream entrada = new ClassPathResource(CAMINHO_ARQUIVO).getInputStream()) {
            catalogoCompleto = objectMapper.readValue(entrada, new TypeReference<List<ExercicioExternoDTO>>() {});
            LOGGER.info("Catálogo local de exercícios carregado: {} exercício(s).", catalogoCompleto.size());
        } catch (IOException exception) {
            // Falha aqui é sempre um erro de empacotamento/deploy (arquivo
            // ausente ou JSON inválido no jar), não uma falha transitória de
            // rede — por isso propaga e derruba o boot em vez de degradar
            // silenciosamente para uma lista vazia, o que esconderia o
            // problema até alguém notar o catálogo sempre vazio em produção.
            throw new IllegalStateException(
                    "Não foi possível carregar o catálogo local de exercícios (" + CAMINHO_ARQUIVO + ").",
                    exception
            );
        }
    }

    /**
     * Filtra o catálogo já carregado em memória pelo grupo muscular. Retorna
     * instantaneamente — nenhuma chamada de rede, nenhum I/O de disco.
     *
     * Nenhum resultado para o músculo pedido NÃO é um erro (o mock só cobre
     * 4 grupos musculares) — devolve lista vazia com 200, e o frontend trata
     * isso como "nenhum exercício encontrado" em vez de um banner de falha.
     */
    public List<ExercicioExternoDTO> buscarExerciciosPorMusculo(String musculo) {
        if (musculo == null || musculo.isBlank()) {
            throw new IllegalArgumentException("O músculo consultado é obrigatório.");
        }

        String valorRecebido = normalizarMusculo(musculo);
        String musculoNormalizado = ALIASES_MUSCULARES.getOrDefault(valorRecebido, valorRecebido);

        return catalogoCompleto.stream()
                .filter(exercicio -> musculoNormalizado.equals(
                        exercicio.muscle() == null ? null : exercicio.muscle().trim().toLowerCase(Locale.ROOT)))
                .toList();
    }

    private String normalizarMusculo(String musculo) {
        return Normalizer.normalize(musculo, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[_-]+", " ")
                .replaceAll("\\s+", " ");
    }
}
