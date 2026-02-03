package com.valentine.valentine.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Requête envoyée par le front quand la personne choisit un des deux rendez-vous.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValentineChoiceRequest {

    /**
     * Identifiant de l'option choisie (1 ou 2).
     */
    @NotNull(message = "L'option choisie est requise")
    private Integer chosenOptionId;

    /**
     * Lieu du rendez-vous choisi (ex. "Restaurant Le Jardin").
     */
    @NotBlank(message = "Le lieu est requis")
    private String chosenPlace;

    /**
     * Date du rendez-vous choisi (ex. "14 février 2025").
     */
    @NotBlank(message = "La date est requise")
    private String chosenDate;
}
