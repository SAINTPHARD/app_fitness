package com.appfitness.service;

import java.net.URI;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import com.appfitness.dto.AlimentoAnaliseDTO;
import com.appfitness.dto.alimento.AlimentoBuscaResponseDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
/**
 * Serviço responsável por interagir com a API Gemini para:
 * 1) análise de imagens de refeições (Gemini Vision) e
 * 2) busca de macronutrientes por texto livre, atuando como uma "food
 *    database" inteligente sem depender de uma API de nutrição terceira
 *    (Edamam/FatSecret) — ver {@link #buscarMacrosPorTexto(String)}.
 * @Service: Indica que esta classe é um serviço Spring, permitindo que seja injetada em outros componentes.
 */
@Service
public class GeminiVisionService {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com";
    private static final Logger LOGGER = LoggerFactory.getLogger(GeminiVisionService.class);
    private static final Duration TIMEOUT_GEMINI = Duration.ofSeconds(20);
    // "-latest" é o alias documentado pela Google para uso via API key simples
    // (sem OAuth/Vertex) — apontamentos fixos sem sufixo já foram descontinuados
    // e respondiam 404 (ver histórico de correção deste service).
    @Value("${gemini.model:gemini-1.5-flash-latest}")
    private String modeloGemini;

	// Chave de API do Gemini Vision, injetada a partir do application.properties ou application.yml
    @Value("${gemini.api.key:}")
    private String apiKey;

    // Injetando dependências do WebClient e ObjectMapper para chamadas HTTP e manipulação de JSON
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // CORREÇÃO: o Spring Boot 4 passou a auto-configurar o ObjectMapper da
    // nova stack Jackson 3 (`tools.jackson.databind.ObjectMapper`), não mais
    // um bean injetável do Jackson 2 clássico (`com.fasterxml.jackson.databind
    // .ObjectMapper`) que este service usa — o Jackson 2 continua no
    // classpath só como dependência transitiva do `java-jwt`, sem virar bean.
    // Por isso o container falhava com "No qualifying bean of type
    // ObjectMapper". Instanciamos a nossa própria (mesmo padrão já usado em
    // `JwtAuthenticationEntryPoint`) em vez de depender de injeção aqui.
    public GeminiVisionService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public List<AlimentoAnaliseDTO> analisarFotoPrato(MultipartFile foto) {
        // Validação preventiva de foto
        if (foto == null || foto.isEmpty()) {
            throw new IllegalArgumentException("O arquivo de foto fornecido está vazio ou é inválido.");
        }

        try {
            // 1. Converte o arquivo recebido para String Base64
            String base64Image = Base64.getEncoder().encodeToString(foto.getBytes());
            String mimeType = (foto.getContentType() != null) ? foto.getContentType() : "image/jpeg";

            // 2. Prompt com instruções estritas de formato
            String promptText = """
                Analise esta foto de uma refeição. Identifique todos os alimentos visíveis,
                estime a porção usando g para sólidos e ml para líquidos e calcule os macronutrientes.
                Retorne um array JSON no seguinte formato:
                [
                  {
                    "nome": "Arroz Branco",
                    "quantidade": "150g",
                    "calorias": 195.0,
                    "proteina": 4.0,
                    "carboidratos": 42.0,
                    "gordura": 0.5
                  }
                ]
                """;

            // 3. Monta o corpo da requisição REST
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", promptText),
                        Map.of("inline_data", Map.of(
                            "mime_type", mimeType,
                            "data", base64Image
                        ))
                    ))
                ),
                "generationConfig", Map.of("response_mime_type", "application/json")
            );

            // 4. Dispara a chamada HTTP para o Gemini 1.5 Flash via WebClient
            String rawResponse = executarGenerateContent(requestBody);

            // 5. Extrai e valida o texto JSON interno da resposta envelope do Gemini
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            JsonNode candidatesNode = rootNode.path("candidates");

            if (!candidatesNode.isArray() || candidatesNode.isEmpty()) {
                throw new RuntimeException("A IA do Gemini não retornou nenhum resultado para esta imagem.");
            }

            String jsonContent = candidatesNode.get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            // 6. Converte o JSON em uma lista de AlimentoAnaliseDTO. Apesar
            // de response_mime_type, alguns modelos ainda envolvem o JSON em
            // cercas Markdown ou texto adicional.
            return objectMapper.readValue(limparRespostaJson(jsonContent),
                    new TypeReference<List<AlimentoAnaliseDTO>>() {});

        } catch (Exception e) {
            // A integração com IA é opcional: timeout, cota, resposta
            // incompleta ou JSON inválido não devem provocar HTTP 500.
            LOGGER.warn("Fallback vazio na análise de imagem do Gemini: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Busca alimentos e seus macronutrientes a partir de um texto livre (ex:
     * "100g de frango e 2 ovos"), usando o Gemini como uma food database
     * inteligente — sem depender de Edamam/FatSecret. O prompt instrui a IA
     * a agir como uma tabela nutricional rigorosa (TACO/USDA), respondendo
     * SÓ com o array JSON dos alimentos reconhecidos no texto.
     */
    public List<AlimentoBuscaResponseDTO> buscarMacrosPorTexto(String busca) {
        if (busca == null || busca.isBlank()) {
            throw new IllegalArgumentException("O texto de busca é obrigatório.");
        }

        try {
            // Prompt restrito: a IA age como consulta a uma tabela
            // nutricional, não como um chat — sem alimentos extras, sem
            // texto fora do JSON, sem arredondar valores de forma imprecisa.
            String promptText = """
                    Você é uma base de dados de tabelas nutricionais (referência TACO/USDA) rigorosa e determinística.
                    Receba um texto descrevendo alimentos e porções e devolva APENAS um array JSON
                    com os alimentos identificados e seus macronutrientes matematicamente corretos
                    para a porção informada (ou para 100g, se nenhuma porção for especificada).

                    Regras obrigatórias:
                    - Devolva SOMENTE o array JSON, sem texto, comentários ou Markdown ao redor.
                    - Um item por alimento reconhecido no texto; ignore o que não for alimento.
                    - Cada item deve conter exatamente estes campos: nome, porcao, calorias, proteinas, carboidratos, gorduras.
                    - "porcao" reflete a quantidade do texto de entrada (ex: "100g", "2 unidades").
                    - Reconheça g, kg, ml, ml., mililitro(s), l, litro(s), copo(s) e unidade(s).
                    - Preserve no campo "porcao" a unidade de volume informada: nunca transforme ml ou l em g.
                    - Para cálculos, converta 1l em 1000ml e considere 1 copo = 250ml, salvo quantidade explícita.
                    - Use a densidade específica quando conhecida (ex.: leite ~1,03g/ml; óleos ~0,92g/ml).
                      Para sucos, água e bebidas aquosas sem densidade conhecida, use aproximadamente 1g/ml.
                    - Os nutrientes devem ser proporcionais ao volume pedido. Ex.: valores por 100ml multiplicados
                      por 2 para uma porção de 200ml.
                    - calorias, proteinas, carboidratos e gorduras são números (não strings), coerentes entre si
                      (aproximadamente calorias = proteinas*4 + carboidratos*4 + gorduras*9) e nunca negativos.
                    - Se o texto não descrever nenhum alimento reconhecível, devolva um array vazio: [].

                    Texto de entrada:
                    """ + busca;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", promptText))
                    )),
                    "generationConfig", Map.of(
                            "response_mime_type", "application/json",
                            "temperature", 0.1
                    )
            );

            String rawResponse = executarGenerateContent(requestBody);

            JsonNode rootNode = objectMapper.readTree(rawResponse);
            JsonNode candidatesNode = rootNode.path("candidates");

            if (!candidatesNode.isArray() || candidatesNode.isEmpty()) {
                throw new RuntimeException("A IA do Gemini não retornou nenhum resultado para esta busca.");
            }

            String jsonContent = candidatesNode.get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            return objectMapper.readValue(limparRespostaJson(jsonContent),
                    new TypeReference<List<AlimentoBuscaResponseDTO>>() {});

        } catch (Exception e) {
            // Busca textual é um enriquecimento opcional. Timeout, cota,
            // indisponibilidade ou JSON inválido não podem derrubar o endpoint.
            LOGGER.warn("Fallback vazio na busca textual do Gemini: {}", e.getMessage());
            return List.of();
        }
    }

    /** Remove cercas Markdown e qualquer texto que envolva o array JSON. */
    static String limparRespostaJson(String resposta) {
        if (resposta == null || resposta.isBlank()) {
            throw new IllegalArgumentException("A resposta textual do Gemini está vazia.");
        }

        String limpa = resposta.trim()
                .replaceFirst("(?is)^```(?:json)?\\s*", "")
                .replaceFirst("(?is)\\s*```$", "")
                .trim();
        int inicioArray = limpa.indexOf('[');
        int fimArray = limpa.lastIndexOf(']');
        if (inicioArray < 0 || fimArray < inicioArray) {
            throw new IllegalArgumentException("A resposta do Gemini não contém um array JSON.");
        }
        return limpa.substring(inicioArray, fimArray + 1);
    }

    /**
     * Monta a URI absoluta e dispara o POST em generateContent — compartilhado
     * por {@link #analisarFotoPrato} e {@link #buscarMacrosPorTexto}.
     *
     * CORREÇÃO (404 Not Found): passar uma String para {@code .uri(String)}
     * faz o WebClient reencodar o template, convertendo o ':' de
     * "gemini-1.5-flash:generateContent" em "%3A" — a Google respondia 404
     * pra essa rota "inexistente". Construindo a URI final com
     * {@link URI#create(String)} e usando {@code .uri(URI)}, a string é
     * usada literalmente, sem reencodar.
     */
    private String executarGenerateContent(Map<String, Object> requestBody) {
        String chave = apiKey == null ? "" : apiKey.trim();
        if (chave.isBlank()) {
            throw new IllegalStateException("A variável GEMINI_API_KEY não foi configurada.");
        }
        String modelo = modeloGemini == null || modeloGemini.isBlank()
                ? "gemini-1.5-flash-latest"
                : modeloGemini.trim();
        URI uri = URI.create(BASE_URL + "/v1beta/models/" + modelo + ":generateContent?key=" + chave);

        return webClient.post()
                .uri(uri)
                // Header preferencial da Google AI Studio, mantido junto ao
                // "?key=" na URL para máxima compatibilidade.
                .header("x-goog-api-key", chave)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(TIMEOUT_GEMINI)
                .block();
    }
}
