package com.appfitness.service;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import com.appfitness.dto.AlimentoAnaliseDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
/**
 * Serviço responsável por interagir com a API Gemini Vision para análise de imagens de refeições.
 * Responsabilidades: 
 * - Receber uma imagem de refeição enviada pelo usuário.
 * - Converter a imagem para Base64 e enviar para a API Gemini Vision.
 * - Receber a resposta da API, extrair o JSON de análise e convertê-lo em uma lista de DTOs.
 * @Service: Indica que esta classe é um serviço Spring, permitindo que seja injetada em outros componentes.
 */
@Service
public class GeminiVisionService {

	// Chave de API do Gemini Vision, injetada a partir do application.properties ou application.yml
    @Value("${gemini.api.key:AIzaSyFakeKeyApenasParaStart}")
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
                estime a quantidade em gramas com base no tamanho do prato e calcule os macronutrientes.
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
            String url = "/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            
            String rawResponse = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // 5. Extrai e valida o texto JSON interno da resposta envelope do Gemini
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            JsonNode candidatesNode = rootNode.path("candidates");

            if (!candidatesNode.isArray() || candidatesNode.isEmpty()) {
                throw new RuntimeException("A IA do Gemini não retornou nenhum resultado para esta imagem.");
            }

            String jsonContent = candidatesNode.get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            // 6. Converte o JSON em uma lista de AlimentoAnaliseDTO
            return objectMapper.readValue(jsonContent, new TypeReference<List<AlimentoAnaliseDTO>>() {});

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar imagem com a IA do Gemini: " + e.getMessage(), e);
        }
    }
}