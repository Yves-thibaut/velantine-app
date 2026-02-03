package com.valentine.valentine.service;

import com.valentine.valentine.dto.ValentineChoiceRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * Envoi des notifications vers le service externe (email).
 * Utilisé pour notifier quand la Valentine a choisi un rendez-vous.
 */
@Service
@Slf4j
public class HttpNotificationSender {

    private final RestTemplate restTemplate;

    @Value("${notification.http.base-url:https://notification.faroty.com/notification-service/api/v1}")
    private String baseUrl;

    @Value("${valentine.notification.client-code:VALENTINE}")
    private String clientCode;

    @Value("${valentine.notification.template-code:VALENTINE_CHOICE}")
    private String templateCode;

    public HttpNotificationSender(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Envoie une notification (email) pour indiquer le choix de rendez-vous.
     *
     * @param recipientEmail email de la personne qui reçoit la notif (toi)
     * @param choice         le choix envoyé par la Valentine
     */
    public void sendValentineChoiceNotification(String recipientEmail, ValentineChoiceRequest choice) {
        try {
            log.info("Envoi notification choix Valentine vers: {}", recipientEmail);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("clientCode", clientCode);
            requestBody.put("externalUserId", "valentine-app");
            requestBody.put("lang", "fr");
            requestBody.put("type", "EMAIL");
            requestBody.put("templateCode", templateCode);
            requestBody.put("recipientEmail", recipientEmail);

            Map<String, Object> params = new HashMap<>();
            params.put("chosenPlace", choice.getChosenPlace());
            params.put("chosenDate", choice.getChosenDate());
            params.put("chosenOptionId", choice.getChosenOptionId());
            requestBody.put("params", params);

            String url = baseUrl + "/email/send";
            sendHttpRequest(url, requestBody);

        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de la notification choix Valentine vers: {}", recipientEmail, e);
            throw new RuntimeException("Échec envoi notification", e);
        }
    }

    private void sendHttpRequest(String url, Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("Notification Valentine envoyée avec succès: {}", url);
        } else {
            log.warn("Réponse notification non 2xx: {} - {}", response.getStatusCode(), response.getBody());
        }
    }
}
