package com.valentine.valentine.controller;

import com.valentine.valentine.dto.ValentineChoiceRequest;
import com.valentine.valentine.service.HttpNotificationSender;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API pour l'app Valentine : enregistrement du choix de rendez-vous et envoi de la notification.
 */
@RestController
@RequestMapping("/api/valentine")
@RequiredArgsConstructor
@Slf4j
public class ValentineController {

    private final HttpNotificationSender notificationSender;

    @Value("${valentine.notification.recipient-email:}")
    private String recipientEmail;

    /**
     * Reçoit le choix de rendez-vous, envoie la notification à l'organisateur.
     */
    @PostMapping("/choice")
    public ResponseEntity<?> submitChoice(@Valid @RequestBody ValentineChoiceRequest request) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("valentine.notification.recipient-email non configuré");
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Configuration manquante"));
        }

        log.info("Choix reçu: option {} - {} le {}", request.getChosenOptionId(), request.getChosenPlace(), request.getChosenDate());

        notificationSender.sendValentineChoiceNotification(recipientEmail, request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message envoyé"
        ));
    }
}
