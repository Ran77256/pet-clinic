package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.response.PromotionDTO;
import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.model.Status;
import com.iis.PetClinic.service.IPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin
public class PromotionController {

    private final IPromotionService promotionService;

    @GetMapping("/all")
    public List<PromotionDTO> getAll() {
        return promotionService.getAllPromotionDTOs();
    }


    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getById(@PathVariable Long id) {
        return promotionService.getPromotionById(id)
                .map(promotion -> {
                    PromotionDTO dto = promotionService.convertToDTO(promotion);
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(
            value = "/add",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public Promotion add(@RequestBody Promotion promotion) {
        Promotion savedPromotion = promotionService.addPromotion(promotion);
        if (savedPromotion.getStatus() == Status.ACTIVE) {
            promotionService.applyPromotionToPriceLists(savedPromotion.getId());
        }
        return savedPromotion;
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PromotionDTO> update(@PathVariable Long id, @RequestBody Promotion updatedPromotion) {
        Promotion updated = promotionService.updatePromotion(id, updatedPromotion);
        return ResponseEntity.ok(promotionService.convertToDTO(updated));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Promotion> activatePromotion(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.activatePromotion(id));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Promotion> deactivatePromotion(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.deactivatePromotion(id));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Void> applyPromotionToAllPriceLists(@PathVariable Long id) {
        promotionService.applyPromotionToAllPriceLists(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-statuses")
    public ResponseEntity<Void> updatePromotionStatuses() {
        promotionService.updatePromotionStatuses();
        return ResponseEntity.ok().build();
    }
}
