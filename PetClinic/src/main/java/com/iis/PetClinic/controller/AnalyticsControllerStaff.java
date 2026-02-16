package com.iis.PetClinic.controller;

import com.iis.PetClinic.repository.IProductRepository;
import com.iis.PetClinic.service.impl.AnalyticsServiceStaff;
import com.iis.PetClinic.repository.IVeterinarianRepository; // DODAJ OVO
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*; // Za List, Map, HashMap, ArrayList

@RestController
@RequestMapping("/api/analyticss")
@RequiredArgsConstructor
@CrossOrigin
public class AnalyticsControllerStaff {

    private final AnalyticsServiceStaff service;
    private final IVeterinarianRepository vetRepo;
    private final IProductRepository prodRepo;


    @GetMapping("/appointments")
    public ResponseEntity<Map<String, Object>> appointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) Long veterinarianId
    ) {
        return ResponseEntity.ok(service.analyze(from, to, status, veterinarianId));
    }

    // METODA ZA PL/SQL IZVEŠTAJ
    @GetMapping("/veterinarian-performance")
    public ResponseEntity<List<Map<String, Object>>> getVetPerformance(@RequestParam int year) {

        List<Object[]> results = vetRepo.getPerformanceReport(year);


        List<Map<String, Object>> report = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("veterinar_ime_prezime", row[0]);
            map.put("specijalizacija", row[1]);
            map.put("ukupno_pregleda", row[2]);
            map.put("broj_razlicitih_vrsta", row[3]);
            map.put("broj_hitnih_slucajeva", row[4]);
            report.add(map);
        }

        return ResponseEntity.ok(report);
    }


    @GetMapping("/inventory-expiry-report")
    public ResponseEntity<List<Map<String, Object>>> getInventoryExpiryReport() {

        List<Object[]> results = prodRepo.getInventoryExpiryReport();


        List<Map<String, Object>> report = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("kategorija", row[0]);
            map.put("artikal", row[1]);
            map.put("kolicina", row[2]);
            map.put("email_dobavljaca", row[3]);

            report.add(map);
        }

        return ResponseEntity.ok(report);
    }
}