package com.groupe.gestionDesStages.exception;

import lombok.Getter;

import java.util.Set;


@Getter
public class ObjectValidationException extends RuntimeException {

    private final Set<String> errorMessages;
    private final String objectName;

    public ObjectValidationException(Set<String> errorMessages, String objectName) {
        super("Validation failed for object: " + objectName + ". Errors: " + String.join(", ", errorMessages));
        this.errorMessages = errorMessages;
        this.objectName = objectName;
    }
}