// src/main/java/com/iis/PetClinic/controller/WaitlistController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.WaitlistCreateRequest;
import com.iis.PetClinic.dto.WaitlistResponse;
import com.iis.PetClinic.service.impl.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService service;

    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<WaitlistResponse> add(@RequestBody WaitlistCreateRequest req) {
        return ResponseEntity.ok(service.add(req));
    }

    // GET /api/waitlist?veterinarianId=1&from=2025-10-01&to=2025-10-31&onlyActive=true
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<WaitlistResponse>> list(
            @RequestParam(required = false) Long veterinarianId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Boolean onlyActive
    ) {
        return ResponseEntity.ok(service.list(veterinarianId, from, to, onlyActive));
    }
}
