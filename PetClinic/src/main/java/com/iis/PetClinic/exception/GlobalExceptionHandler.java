package com.iis.PetClinic.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BarcodeAlreadyExistsException.class)
    public ResponseEntity<Object> handleBarcodeAlreadyExists(BarcodeAlreadyExistsException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());
        body.put("timestamp", new java.util.Date());

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }
}
