package com.iis.PetClinic.controller;


import com.iis.PetClinic.dto.request.PriceListDTO;
import com.iis.PetClinic.dto.request.PriceListItemDTO;
import com.iis.PetClinic.dto.request.PublishPriceListRequest;
import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.repository.IPriceListRepository;
import com.iis.PetClinic.service.impl.PriceListVersioningService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/price-lists")
@CrossOrigin
@RequiredArgsConstructor
public class PriceListController {

    private final PriceListVersioningService versioningService;
    private final IPriceListRepository priceListRepo;
    // 1) Kreiraj DRAFT klonom ACTIVE (Save as new version)
    @PostMapping("/draft-from-active")
    public ResponseEntity<PriceListDTO> createDraftFromActive(
            @RequestParam(required = false) String nameForDraft
    ) {
        PriceList draft = versioningService.createDraftFromActive(nameForDraft);
        return ResponseEntity.ok(toDTO(draft));
    }
    @GetMapping("/current")
    public ResponseEntity<PriceListDTO> getCurrent() {
        var now = LocalDateTime.now();
        return priceListRepo.findActiveAt(now)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // 2) Objavi DRAFT (publish) od zadatog datuma
    @PostMapping("/{draftId}/publish")
    public ResponseEntity<PriceListDTO> publishDraft(
            @PathVariable Long draftId,
            @RequestBody PublishPriceListRequest req
    ) {
        PriceList published = versioningService.publishDraft(draftId, req.getEffectiveFrom());
        return ResponseEntity.ok(toDTO(published));
    }

    // 3) Vratiti cenu usluge u trenutku "at"
    @GetMapping("/price")
    public ResponseEntity<BigDecimal> getPriceAt(
            @RequestParam Long serviceId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime at
    ) {
        return ResponseEntity.ok(versioningService.getPriceAt(serviceId, at));
    }

    // --- Mapperi (brzi manualni) ---
    private PriceListDTO toDTO(PriceList e) {
        return PriceListDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .version(e.getVersion())
                .status(e.getStatus().name())
                .validFrom(e.getValidFrom())
                .validTo(e.getValidTo())
                .items(
                        e.getItems().stream()
                                .map(it -> PriceListItemDTO.builder()
                                        .id(it.getId())
                                        .serviceId(it.getService().getId())
                                        .serviceName(it.getService().getName())
                                        .price(it.getPrice())
                                        .build())
                                .collect(Collectors.toList())
                )
                .build();
    }
}
