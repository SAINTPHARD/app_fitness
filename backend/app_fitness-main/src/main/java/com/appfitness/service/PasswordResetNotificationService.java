package com.appfitness.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

import com.appfitness.model.entity.Usuario;

@Service
public class PasswordResetNotificationService {

    private final boolean mailEnabled;
    private final String remetente;
    private final String frontendUrl;
    private final String apiUrl;
    private final String apiKey;
    private final RestClient restClient;

    public PasswordResetNotificationService(
            @Value("${app.password-reset.mail-enabled:false}") boolean mailEnabled,
            @Value("${app.password-reset.from}") String remetente,
            @Value("${app.password-reset.frontend-url}") String frontendUrl,
            @Value("${app.password-reset.mail-api-url:}") String apiUrl,
            @Value("${app.password-reset.mail-api-key:}") String apiKey) {
        this.mailEnabled = mailEnabled;
        this.remetente = remetente;
        this.frontendUrl = frontendUrl;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.restClient = RestClient.create();
    }

    public boolean enviar(Usuario usuario, String token) {
        if (!mailEnabled || apiUrl.isBlank() || apiKey.isBlank()) {
            return false;
        }

        String link = frontendUrl + "?token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8);
        String texto = "Recebemos uma solicitação para redefinir sua senha. "
                + "O link abaixo expira em 30 minutos e só pode ser usado uma vez:\n\n"
                + link
                + "\n\nSe você não fez esta solicitação, ignore esta mensagem.";
        Map<String, Object> payload = Map.of(
                "sender", Map.of("email", remetente),
                "to", List.of(Map.of("email", usuario.getEmail())),
                "subject", "Redefinição de senha — System Fitness",
                "textContent", texto);

        try {
            restClient.post()
                    .uri(apiUrl)
                    .header("api-key", apiKey)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (RestClientException ex) {
            return false;
        }
    }
}
