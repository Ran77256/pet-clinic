package com.iis.PetClinic.exception;

public class BarcodeAlreadyExistsException extends RuntimeException {

    public BarcodeAlreadyExistsException(String message) {
        super(message);
    }

    public BarcodeAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}

