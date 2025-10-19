package com.iis.PetClinic.controller;


import com.iis.PetClinic.dto.request.PriceListDTO;
import com.iis.PetClinic.dto.request.PriceListItemDTO;
import com.iis.PetClinic.dto.request.PublishPriceListRequest;
import com.iis.PetClinic.model.PriceList;
import com.iis.PetClinic.model.PriceListItem;
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

    // Pregled pojedinačnog cenovnika
    @GetMapping("/{id}")
    public ResponseEntity<PriceListDTO> getPriceList(@PathVariable Long id) {
        return priceListRepo.findById(id)
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
    @PutMapping("/activate/{id}")
    public ResponseEntity<String> activatePriceList(@PathVariable Long id) {
        try {
            versioningService.activatePriceList(id);
            return ResponseEntity.ok("Price list " + id + " successfully activated.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Unexpected error occurred: " + e.getMessage());
        }
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



    private PriceListDTO toDTO(PriceList e) {
        var items = (e.getItems() == null) ? java.util.List.<PriceListItem>of() : e.getItems();

        return PriceListDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .version(e.getVersion())
                .status(e.getStatus().name())
                .validFrom(e.getValidFrom())
                .validTo(e.getValidTo())
                .items(
                        items.stream()
                                .map(it -> PriceListItemDTO.builder()
                                        .id(it.getId())
                                        .serviceId(it.getService().getId())
                                        .serviceName(it.getService().getName())
                                        .price(it.getPrice())
                                        .build())
                                .toList()
                )
                .build();
    }

    @GetMapping("/drafts")
    public ResponseEntity<java.util.List<PriceListDTO>> getDrafts(
            @RequestParam(defaultValue = "true") boolean includeItems
    ) {
        var drafts = includeItems
                ? priceListRepo.findDraftsWithItems()
                : priceListRepo.findByStatusOrderByVersionDesc(com.iis.PetClinic.model.PriceListStatus.DRAFT);

        var dtos = drafts.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(dtos);
    }
    @GetMapping("/getall")
    public ResponseEntity<java.util.List<PriceListDTO>> getAll(

    ) {
        var all = priceListRepo.findAll(); // radi odmah; vidi napomenu ispod za optimizaciju
        var dtos = all.stream()
                .map(pl -> toDTO(pl))
                .toList();
        return ResponseEntity.ok(dtos);
    }


}
