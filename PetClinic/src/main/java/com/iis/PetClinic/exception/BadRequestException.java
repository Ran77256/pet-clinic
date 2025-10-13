package com.iis.PetClinic.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
