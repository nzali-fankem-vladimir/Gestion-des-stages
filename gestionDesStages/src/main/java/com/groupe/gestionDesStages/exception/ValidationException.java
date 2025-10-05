package com.groupe.gestionDesStages.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) // Renvoie un statut 400 Bad Request
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
